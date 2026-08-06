import "server-only";
import { unstable_cache } from "next/cache";

import { squareClient, squareLocationId } from "./client";
import type { Categorie, Merk, Montuurvorm, Product, Sterktesoort, Specificatie, Techniek, Variant } from "@/types/product";
import { categorieen as categorieInhoud } from "@/data/categorieen";
import { merken as merkInhoud } from "@/data/merken";

/**
 * Live sync-laag over de Square-catalogus. Vervangt de statische
 * data/producten.ts + data/merken.ts + data/categorieen.ts als bron van
 * producten - Square is nu de bron van waarheid voor assortiment, prijzen en
 * categorieen. data/merken.ts en data/categorieen.ts blijven bestaan als
 * puur redactionele inhoud (omschrijving, hero-afbeelding): Square's
 * Catalog API heeft geen veld voor marketingcopy per categorie/merk, dus die
 * twee bestanden zijn nu een content-overlay, geen productdata meer.
 *
 * Zie docs/square-mapping-notes.md voor de volledige onderbouwing van elke
 * beslissing hieronder (facet-categorieen i.p.v. custom attributes,
 * trackInventory:false i.p.v. verzonnen voorraadaantallen, enz.).
 */

const NIEUW_BINNEN_DAGEN = 120;

interface RuwCatalogusObject {
  id: string;
  type: string;
  createdAt?: string;
  categoryData?: { name?: string };
  imageData?: { url?: string };
  itemOptionValueData?: { name?: string; color?: string };
  itemData?: {
    name?: string;
    descriptionHtml?: string;
    imageIds?: string[];
    categories?: { id?: string }[];
    itemOptions?: { itemOptionId?: string }[];
    variations?: RuwCatalogusObject[];
  };
  itemVariationData?: {
    itemId?: string;
    name?: string;
    sku?: string;
    priceMoney?: { amount?: bigint | number; currency?: string };
    itemOptionValues?: { itemOptionId?: string; itemOptionValueId?: string }[];
    trackInventory?: boolean;
  };
}

function decodeHtml(tekst: string): string {
  return tekst.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&").trim();
}

/**
 * descriptionHtml wordt door scripts/square-catalog-sync.ts in een vaste,
 * machineleesbare vorm geschreven: eerste <p> is de korte omschrijving, de
 * overige <p>'s de lange beschrijving, en de eerste/tweede <ul> zijn
 * kenmerken/specificaties.
 *
 * De sync-script-versie gaf die twee <ul>'s eerst een onderscheidend
 * data-attribuut, maar Square saniteert descriptionHtml bij het opslaan en
 * strip niet-standaard attributen eruit (geverifieerd tegen de sandbox) - dus
 * dit leest puur op volgorde. Alleen scripts/square-catalog-sync.ts schrijft
 * dit veld en garandeert die volgorde, dus dat is veilig.
 */
function parseDescriptionHtml(html: string | undefined): {
  korteBeschrijving: string;
  beschrijving: string;
  kenmerken: string[];
  specificaties: Specificatie[];
} {
  const safe = html ?? "";
  const paragrafen = [...safe.matchAll(/<p>([\s\S]*?)<\/p>/g)].map((m) => decodeHtml(m[1]));
  const lijsten = [...safe.matchAll(/<ul[^>]*>([\s\S]*?)<\/ul>/g)];

  const kenmerken = lijsten[0]
    ? [...lijsten[0][1].matchAll(/<li>([\s\S]*?)<\/li>/g)].map((m) => decodeHtml(m[1]))
    : [];

  const specificaties: Specificatie[] = lijsten[1]
    ? [...lijsten[1][1].matchAll(/<li>([\s\S]*?)<\/li>/g)].map((m) => {
        const tekst = decodeHtml(m[1]);
        const idx = tekst.indexOf(": ");
        return idx === -1 ? { label: tekst, waarde: "" } : { label: tekst.slice(0, idx), waarde: tekst.slice(idx + 2) };
      })
    : [];

  return {
    korteBeschrijving: paragrafen[0] ?? "",
    beschrijving: paragrafen.slice(1).join(" "),
    kenmerken,
    specificaties,
  };
}

function slugifyKleur(naam: string): string {
  return naam
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

interface Catalogusdata {
  producten: Product[];
  categorieen: Categorie[];
  merken: Merk[];
  opgehaaldOp: string;
}

async function haalRuweCatalogusOp(): Promise<RuwCatalogusObject[]> {
  const client = squareClient();
  const objecten: RuwCatalogusObject[] = [];
  let cursor: string | undefined;
  do {
    const res = await client.catalog.search({
      objectTypes: ["ITEM", "CATEGORY", "ITEM_OPTION", "ITEM_OPTION_VAL", "IMAGE"],
      includeRelatedObjects: true,
      cursor,
    });
    objecten.push(...((res.objects ?? []) as RuwCatalogusObject[]));
    if (res.relatedObjects) objecten.push(...(res.relatedObjects as RuwCatalogusObject[]));
    cursor = res.cursor;
  } while (cursor);

  const byId = new Map<string, RuwCatalogusObject>();
  for (const o of objecten) byId.set(o.id, o);
  return [...byId.values()];
}

/**
 * Haalt echte voorraadaantallen op via de Inventory API, alleen voor
 * variaties waarop UKM `trackInventory` heeft aangezet in Square. Variaties
 * zonder IN_STOCK-record (getrackt maar leeg) tellen als 0; niet-getrackte
 * variaties krijgen hier geen entry en blijven in bouwCatalogus() altijd
 * besteltbaar, zoals voorheen.
 */
async function haalVoorraadOp(variatieIds: string[]): Promise<Map<string, number>> {
  const voorraadPerId = new Map<string, number>();
  if (variatieIds.length === 0) return voorraadPerId;

  const client = squareClient();
  // Square staat maximaal 1000 catalogObjectIds per aanvraag toe.
  for (let i = 0; i < variatieIds.length; i += 1000) {
    const stuk = variatieIds.slice(i, i + 1000);
    const pagina = await client.inventory.batchGetCounts({
      catalogObjectIds: stuk,
      locationIds: [squareLocationId()],
      states: ["IN_STOCK"],
    });
    for await (const count of pagina) {
      if (count.catalogObjectId) {
        voorraadPerId.set(count.catalogObjectId, Number(count.quantity ?? "0"));
      }
    }
  }
  return voorraadPerId;
}

function bouwCatalogus(alle: RuwCatalogusObject[], voorraadPerId: Map<string, number>): Catalogusdata {
  const categorieObjecten = alle.filter((o) => o.type === "CATEGORY");
  const itemObjecten = alle.filter((o) => o.type === "ITEM");
  const imageObjecten = alle.filter((o) => o.type === "IMAGE");
  const optieWaardeObjecten = alle.filter((o) => o.type === "ITEM_OPTION_VAL");

  const imageUrlById = new Map<string, string>();
  for (const img of imageObjecten) if (img.imageData?.url) imageUrlById.set(img.id, img.imageData.url);

  const optieWaardeById = new Map<string, { naam: string; hex?: string }>();
  for (const ov of optieWaardeObjecten) {
    optieWaardeById.set(ov.id, { naam: ov.itemOptionValueData?.name ?? "", hex: ov.itemOptionValueData?.color });
  }

  const categorieNaamById = new Map<string, string>();
  for (const c of categorieObjecten) if (c.categoryData?.name) categorieNaamById.set(c.id, c.categoryData.name);

  function facetWaarde(prefix: string, categorieIds: string[]): string | undefined {
    for (const id of categorieIds) {
      const naam = categorieNaamById.get(id);
      if (naam?.startsWith(`${prefix}: `)) return naam.slice(prefix.length + 2);
    }
    return undefined;
  }
  function facetWaarden(prefix: string, categorieIds: string[]): string[] {
    const gevonden: string[] = [];
    for (const id of categorieIds) {
      const naam = categorieNaamById.get(id);
      if (naam?.startsWith(`${prefix}: `)) gevonden.push(naam.slice(prefix.length + 2));
    }
    return gevonden;
  }
  function navigatieCategorieSlug(categorieIds: string[]): string | undefined {
    for (const id of categorieIds) {
      const naam = categorieNaamById.get(id);
      if (naam && !naam.includes(": ")) {
        const match = categorieInhoud.find((c) => c.naam === naam);
        if (match) return match.slug;
      }
    }
    return undefined;
  }

  const nu = Date.now();
  const producten: Product[] = [];

  for (const item of itemObjecten) {
    const data = item.itemData;
    if (!data?.name) continue;

    const categorieIds = (data.categories ?? []).map((c) => c.id).filter((id): id is string => !!id);
    // Bij voorkeur de expliciete "Slug: ..."-facetcategorie (garandeert
    // stabiele URL's), maar een item zonder die tag - bijv. gewoon via het
    // Square-dashboard aangemaakt, zonder onze facet-conventie - mag niet
    // stilzwijgend verdwijnen. Dan valt dit terug op de itemnaam; duplicaten
    // worden na de loop ontdubbeld.
    const slug = facetWaarde("Slug", categorieIds) ?? slugifyKleur(data.name);

    const techniekWaarde = facetWaarde("Techniek", categorieIds); // "PTC" | "Non-PTC"
    const vormWaarde = facetWaarde("Vorm", categorieIds);
    const sterktesoortWaarde = facetWaarde("Sterktesoort", categorieIds); // "Met sterkte" | "Zonder sterkte"
    const kleurfamilieWaarde = facetWaarde("Kleurfamilie", categorieIds);
    const merkWaarde = facetWaarde("Merk", categorieIds);
    const labelWaarden = facetWaarden("Label", categorieIds).map((l) => l.toLowerCase());
    const navSlug = navigatieCategorieSlug(categorieIds);

    const soort: "bril" | "lens" = sterktesoortWaarde ? "lens" : "bril";
    const techniek: Techniek | undefined = techniekWaarde ? (techniekWaarde === "PTC" ? "ptc" : "non-ptc") : undefined;
    const sterktesoort: Sterktesoort | undefined = sterktesoortWaarde
      ? sterktesoortWaarde === "Met sterkte"
        ? "met-sterkte"
        : "zonder-sterkte"
      : undefined;
    const vorm = vormWaarde?.toLowerCase().replace(/ /g, "-") as Montuurvorm | undefined;

    const variaties = data.variations ?? [];
    const heeftKleuropties = (data.itemOptions?.length ?? 0) > 0;

    // Alleen vertrouwen op de Inventory API als een variatie trackInventory
    // heeft aanstaan in Square; anders altijd besteltbaar (geen verzonnen
    // aantal), zoals voorheen.
    const variatieVoorraad = (v: RuwCatalogusObject): number =>
      v.itemVariationData?.trackInventory ? (voorraadPerId.get(v.id) ?? 0) : 999;

    const varianten: Variant[] = heeftKleuropties
      ? variaties.map((v) => {
          const ov = v.itemVariationData?.itemOptionValues?.[0];
          const waarde = ov?.itemOptionValueId ? optieWaardeById.get(ov.itemOptionValueId) : undefined;
          const naam = waarde?.naam ?? v.itemVariationData?.name ?? "Standaard";
          return {
            id: slugifyKleur(naam),
            naam,
            swatch: waarde?.hex ? `#${waarde.hex}` : "#cccccc",
            prijs: v.itemVariationData?.priceMoney?.amount
              ? Number(v.itemVariationData.priceMoney.amount) / 100
              : undefined,
            voorraad: variatieVoorraad(v),
            afbeelding: imageUrlById.get(data.imageIds?.[0] ?? ""),
          };
        })
      : [];

    const eerstePrijs = variaties[0]?.itemVariationData?.priceMoney?.amount;
    const prijs = eerstePrijs ? Number(eerstePrijs) / 100 : 0;

    const { korteBeschrijving, beschrijving, kenmerken, specificaties } = parseDescriptionHtml(data.descriptionHtml);

    const afbeeldingen = (data.imageIds ?? []).map((id) => imageUrlById.get(id)).filter((u): u is string => !!u);

    const toegevoegdOp = item.createdAt ? item.createdAt.slice(0, 10) : new Date(nu).toISOString().slice(0, 10);
    const isNieuwBinnen = item.createdAt
      ? (nu - new Date(item.createdAt).getTime()) / 86_400_000 <= NIEUW_BINNEN_DAGEN
      : false;

    const labels = [...labelWaarden];
    if (isNieuwBinnen && !labels.includes("nieuw")) labels.push("nieuw");

    const populariteit = labels.includes("bestseller") ? 100 : 50;
    // Productniveau-voorraad = som van alle Square-variaties, ook zonder
    // kleuropties (dan is er precies één variatie). Zo blijft "op
    // voorraad"-filtering (opVoorraad in producten.ts) correct ongeacht of
    // het product varianten toont.
    const voorraad = variaties.reduce((totaal, v) => totaal + variatieVoorraad(v), 0);

    producten.push({
      id: item.id,
      slug,
      naam: data.name,
      catalogusnaam: data.name,
      soort,
      categorie: navSlug ?? (soort === "bril" ? "ptc" : "lenzen-met-sterkte"),
      subcategorie: soort === "bril" ? (vormWaarde ?? "") : (kleurfamilieWaarde ?? ""),
      merk: merkInhoud.find((m) => m.naam === merkWaarde)?.slug ?? "",
      prijs,
      vanPrijs: undefined, // geblokkeerd door een Square-platformbug op custom attributes, zie docs/square-mapping-notes.md
      afbeeldingen,
      korteBeschrijving,
      beschrijving,
      kenmerken,
      specificaties,
      varianten,
      voorraad,
      populariteit,
      toegevoegdOp,
      labels,
      techniek,
      vorm,
      sterktesoort,
      sterktebereik: soort === "lens" ? specificaties.find((s) => s.label === "Sterkte")?.waarde : undefined,
      kleurfamilie: kleurfamilieWaarde?.toLowerCase(),
      bron: "Square",
    });
  }

  // Items zonder "Slug: ..."-facetcategorie vallen terug op een van de naam
  // afgeleide slug (zie hierboven); bij gelijke productnamen ontdubbelen met
  // een stukje item-id, zodat elke URL uniek blijft.
  const slugAantal = new Map<string, number>();
  for (const p of producten) slugAantal.set(p.slug, (slugAantal.get(p.slug) ?? 0) + 1);
  for (const p of producten) {
    if ((slugAantal.get(p.slug) ?? 0) > 1) p.slug = `${p.slug}-${p.id.slice(-6)}`;
  }

  const categorieen: Categorie[] = categorieInhoud.map((c) => ({
    ...c,
    aantal: producten.filter((p) => p.categorie === c.slug).length,
  }));

  const merken: Merk[] = merkInhoud.map((m) => ({
    ...m,
    aantal: producten.filter((p) => p.merk === m.slug).length,
  }));

  return { producten, categorieen, merken, opgehaaldOp: new Date(nu).toISOString() };
}

const haalCatalogusOpGecached = unstable_cache(
  async (): Promise<Catalogusdata> => {
    const alle = await haalRuweCatalogusOp();
    const variatieIds = alle
      .filter((o) => o.type === "ITEM")
      .flatMap((o) => (o.itemData?.variations ?? []).map((v) => v.id));
    const voorraadPerId = await haalVoorraadOp(variatieIds);
    return bouwCatalogus(alle, voorraadPerId);
  },
  ["square-catalogus"],
  // 1u is een vangnet; catalog.version.updated/inventory.count.updated-webhooks
  // (app/api/webhooks/square/route.ts) revalideren de tag "square-catalog"
  // direct zodra Square iets meldt.
  { tags: ["square-catalog"], revalidate: 3600 },
);

export async function catalogus(): Promise<Catalogusdata> {
  return haalCatalogusOpGecached();
}
