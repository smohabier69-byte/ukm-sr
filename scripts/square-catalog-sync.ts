/**
 * Volledige, herhaalbare sync van het UKM-assortiment naar Square.
 *
 * Bron is data/producten.ts - exact dezelfde `Product`-objecten die de
 * winkel toont zolang Square nog leeg is (zie lib/square/catalog.server.ts).
 * Zo kunnen winkel en Square nooit uit elkaar lopen: wat hier naar Square
 * gaat, is wat er op de site stond.
 *
 *   npx tsx scripts/square-catalog-sync.ts            (voegt toe)
 *   npx tsx scripts/square-catalog-sync.ts --wis      (wist EERST de hele catalogus)
 *   npx tsx scripts/square-catalog-sync.ts --met-fotos (uploadt ook de productfoto's)
 *
 * Standaard gaan alleen namen, prijzen, kleuren en categorieen naar Square:
 * UKM wil geen foto's in Square. De website toont haar eigen foto's.
 *
 * Draai eerst scripts/square-account-check.mjs om te zien naar welke account
 * dit schrijft. De prijs gaat als hetzelfde getal in de valuta van de
 * account (SQUARE_CURRENCY); de website toont het bedrag altijd als SRD.
 *
 * Beslissingen (zie ook docs/square-mapping-notes.md):
 * - Voorraad wordt niet als verzonnen aantal gesynchroniseerd. Variaties
 *   krijgen geen voorraadtelling (altijd bestelbaar) tot UKM in Square een
 *   aantal invult. Wat de prijslijst als "Sold out" afstempelt, krijgt de
 *   telling wel aan, zonder aantal: dat is 0 op voorraad.
 * - Foto's krijgen hun lokale pad als bijschrift; de website gebruikt dan
 *   haar eigen bestand (lib/square/catalog.server.ts).
 * - Facetten (Techniek, Vorm, Sterktesoort, Kleurfamilie, Merk, Slug, Label)
 *   gaan als categorieen met een prefix, niet als custom attributes: die
 *   blijven op een ITEM niet hangen (bevinding 8 in de mapping-notities).
 * - Vanaf-prijs wordt om dezelfde reden niet gesynchroniseerd.
 * - Square accepteert geen WebP; foto's worden bij het uploaden naar JPEG
 *   omgezet.
 */
import process from "node:process";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { SquareClient, SquareEnvironment } from "square";

import { producten } from "../data/producten";
import { hoofdcategorieen, categorieen } from "../data/categorieen";
import { merken } from "../data/merken";
import { vormprofielen, kleurprofielen, type Kleurfamilie } from "../data/catalogus/gemeenschappelijk";

process.loadEnvFile(".env.local");

const token = process.env.SQUARE_ACCESS_TOKEN;
if (!token) {
  console.error("SQUARE_ACCESS_TOKEN ontbreekt in .env.local.");
  process.exit(1);
}

const isProductie = process.env.SQUARE_ENVIRONMENT === "production";
/** De valuta van een prijs moet exact overeenkomen met die van de Square-account. */
const VALUTA = process.env.SQUARE_CURRENCY ?? (isProductie ? "SRD" : "USD");
const WIS_EERST = process.argv.includes("--wis");
const MET_FOTOS = process.argv.includes("--met-fotos");

const client = new SquareClient({
  token,
  environment: isProductie ? SquareEnvironment.Production : SquareEnvironment.Sandbox,
});

function naarSquareHex(hex: string): string {
  return hex.replace(/^#/, "").slice(0, 6);
}

function escapeHtml(tekst: string): string {
  return tekst.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * Vaste, machineleesbare vorm van descriptionHtml: eerste <p> is de korte
 * omschrijving, de overige <p>'s samen de lange beschrijving, en de eerste/
 * tweede <ul> zijn kenmerken/specificaties. lib/square/catalog.server.ts leest
 * dit puur op volgorde terug - Square saniteert descriptionHtml bij het
 * opslaan, dus alleen de volgorde is betrouwbaar.
 */
function bouwDescriptionHtml(
  intro: string,
  alineas: string[],
  kenmerken: string[],
  specificaties: [string, string][],
): string {
  return [
    `<p>${escapeHtml(intro)}</p>`,
    ...alineas.map((p) => `<p>${escapeHtml(p)}</p>`),
    `<ul>${kenmerken.map((k) => `<li>${escapeHtml(k)}</li>`).join("")}</ul>`,
    `<ul>${specificaties.map(([l, w]) => `<li>${escapeHtml(l)}: ${escapeHtml(w)}</li>`).join("")}</ul>`,
  ].join("");
}

/* -------------------------------------------------------------------------- */
/* Stap 0 (alleen met --wis): bestaande catalogus leegmaken                    */
/* -------------------------------------------------------------------------- */

async function wisCatalogus() {
  // De account bevat ook de Pink by Moon-charms (andere winkel, zelfde
  // eigenaar). Die categorie, haar items, variaties en foto's blijven staan.
  const alle: { id?: string; type?: string; categoryData?: { name?: string }; itemData?: { categories?: { id?: string }[]; imageIds?: string[]; variations?: { id?: string }[] } }[] = [];
  const pagina = await client.catalog.list();
  for await (const obj of pagina) alle.push(obj as (typeof alle)[number]);
  const pinkCategorieen = new Set(
    alle
      .filter((o) => o.type === "CATEGORY")
      .filter((o) => o.categoryData?.name === "Pink by Moon" || o.categoryData?.name?.startsWith("Pink: "))
      .map((o) => o.id),
  );
  const behouden = new Set<string | undefined>(pinkCategorieen);
  for (const o of alle) {
    if (o.type !== "ITEM" || !(o.itemData?.categories ?? []).some((c) => pinkCategorieen.has(c.id))) continue;
    behouden.add(o.id);
    for (const v of o.itemData?.variations ?? []) behouden.add(v.id);
    for (const img of o.itemData?.imageIds ?? []) behouden.add(img);
  }
  const ids = alle.map((o) => o.id).filter((id): id is string => !!id && !behouden.has(id));
  if (behouden.size > 0) console.log(`Pink by Moon blijft staan (${behouden.size} objecten).`);
  if (ids.length === 0) {
    console.log("Catalogus is al leeg.");
    return;
  }
  for (let i = 0; i < ids.length; i += 200) {
    await client.catalog.batchDelete({ objectIds: ids.slice(i, i + 200) });
  }
  console.log(`Verwijderd: ${ids.length} bestaande objecten.`);
}

/* -------------------------------------------------------------------------- */
/* Stap 1: categorieen (navigatie + facetten)                                  */
/* -------------------------------------------------------------------------- */

let tempCounter = 0;
const tempId = (prefix: string) => `#${prefix}-${++tempCounter}`;

const objecten: Record<string, unknown>[] = [];
const categorieIdBySlug = new Map<string, string>();

for (const hoofd of hoofdcategorieen) {
  const id = tempId("cat");
  categorieIdBySlug.set(hoofd.slug, id);
  objecten.push({ id, type: "CATEGORY", categoryData: { name: hoofd.naam, categoryType: "REGULAR_CATEGORY" } });
}
for (const cat of categorieen) {
  const ouderSlug = hoofdcategorieen.find((h) => h.subcategorieen.includes(cat.slug))?.slug;
  const id = tempId("cat");
  categorieIdBySlug.set(cat.slug, id);
  objecten.push({
    id,
    type: "CATEGORY",
    categoryData: {
      name: cat.naam,
      categoryType: "REGULAR_CATEGORY",
      parentCategory: ouderSlug ? { id: categorieIdBySlug.get(ouderSlug) } : undefined,
    },
  });
}

const facetCategorieId = new Map<string, string>();
function facetCategorie(prefix: string, waarde: string): string {
  const naam = `${prefix}: ${waarde}`;
  const bestaand = facetCategorieId.get(naam);
  if (bestaand) return bestaand;
  const id = tempId("facet");
  facetCategorieId.set(naam, id);
  objecten.push({ id, type: "CATEGORY", categoryData: { name: naam, categoryType: "REGULAR_CATEGORY" } });
  return id;
}

/* -------------------------------------------------------------------------- */
/* Stap 2: kleur item-optie (gedeeld over alle artikelen met varianten)        */
/* -------------------------------------------------------------------------- */

const kleurOptieId = tempId("itemopt");
// Square staat maar een waarde per naam toe binnen een item-optie; de kleurnaam
// (niet de exacte hex) is de dedup-sleutel. De eerst geziene hex wint.
const kleurWaardeIdPerNaam = new Map<string, string>();
const kleurWaardeObjecten: Record<string, unknown>[] = [];

function kleurWaardeId(naam: string, hex: string): string {
  const bestaand = kleurWaardeIdPerNaam.get(naam);
  if (bestaand) return bestaand;
  const id = tempId("itemoptval");
  kleurWaardeIdPerNaam.set(naam, id);
  kleurWaardeObjecten.push({
    id,
    type: "ITEM_OPTION_VAL",
    itemOptionValueData: { itemOptionId: kleurOptieId, name: naam, color: naarSquareHex(hex) },
  });
  return id;
}

for (const product of producten) {
  for (const variant of product.varianten) kleurWaardeId(variant.naam, variant.swatch);
}
if (kleurWaardeObjecten.length > 0) {
  objecten.push({
    id: kleurOptieId,
    type: "ITEM_OPTION",
    itemOptionData: { name: "Kleur", displayName: "Kleur", showColors: true },
  });
  objecten.push(...kleurWaardeObjecten);
}

/* -------------------------------------------------------------------------- */
/* Stap 3: producten (items + variaties)                                       */
/* -------------------------------------------------------------------------- */

interface ItemPlan {
  slug: string;
  itemId: string;
  afbeeldingen: string[]; // publieke paden, bijv. "/producten/nov26/dames/dames-p005-1.webp"
}
const itemPlannen: ItemPlan[] = [];
const uitverkochtMeldingen: string[] = [];

function variatie(
  itemId: string,
  naam: string,
  sku: string,
  prijs: number,
  optie?: { naam: string; swatch: string },
  uitverkocht = false,
) {
  return {
    id: tempId("variant"),
    type: "ITEM_VARIATION",
    itemVariationData: {
      itemId,
      name: naam,
      sku,
      pricingType: "FIXED_PRICING",
      priceMoney: { amount: BigInt(Math.round(prijs * 100)), currency: VALUTA },
      // Uitverkocht in de prijslijst: voorraadtelling aan zonder aantal = 0 op voorraad.
      // De rest blijft zonder telling (altijd bestelbaar) tot UKM een aantal invult.
      trackInventory: uitverkocht,
      sellable: true,
      stockable: true,
      itemOptionValues: optie
        ? [{ itemOptionId: kleurOptieId, itemOptionValueId: kleurWaardeId(optie.naam, optie.swatch) }]
        : undefined,
    },
  };
}

for (const product of producten) {
  const descriptionHtml = bouwDescriptionHtml(
    product.korteBeschrijving,
    [product.beschrijving],
    product.kenmerken,
    product.specificaties.map((s) => [s.label, s.waarde] as [string, string]),
  );

  const categorieen_: { id: string }[] = [];
  const categorieId = categorieIdBySlug.get(product.categorie);
  if (categorieId) categorieen_.push({ id: categorieId });
  if (product.techniek) {
    const techniekNaam = { ptc: "PTC", "non-ptc": "Non-PTC", nachtzicht: "Nachtzicht" }[product.techniek];
    categorieen_.push({ id: facetCategorie("Techniek", techniekNaam) });
  }
  if (product.vorm) categorieen_.push({ id: facetCategorie("Vorm", vormprofielen[product.vorm].naam) });
  if (product.sterktesoort) {
    categorieen_.push({
      id: facetCategorie("Sterktesoort", product.sterktesoort === "met-sterkte" ? "Met sterkte" : "Zonder sterkte"),
    });
  }
  if (product.kleurfamilie) {
    categorieen_.push({
      id: facetCategorie("Kleurfamilie", kleurprofielen[product.kleurfamilie as Kleurfamilie].familie),
    });
  }
  const merk = merken.find((m) => m.slug === product.merk);
  if (merk) categorieen_.push({ id: facetCategorie("Merk", merk.naam) });
  // De mens-leesbare slug is niet betrouwbaar uit de naam af te leiden (twee
  // lenzen heten allebei "Ash Grey"), dus die gaat mee als eigen facet.
  categorieen_.push({ id: facetCategorie("Slug", product.slug) });
  if (product.labels.includes("bestseller")) categorieen_.push({ id: facetCategorie("Label", "Bestseller") });
  if (product.labels.includes("nieuw")) categorieen_.push({ id: facetCategorie("Label", "Nieuw") });

  const itemId = tempId("item");
  const heeftVarianten = product.varianten.length > 0;
  const variations = heeftVarianten
    ? product.varianten.map((v) =>
        variatie(
          itemId,
          v.naam,
          `${product.slug}-${v.id}`,
          v.prijs ?? product.prijs,
          { naam: v.naam, swatch: v.swatch },
          v.voorraad === 0,
        ),
      )
    : [variatie(itemId, "Standaard", product.slug, product.prijs, undefined, product.voorraad === 0)];

  if (heeftVarianten) {
    for (const v of product.varianten) if (v.voorraad === 0) uitverkochtMeldingen.push(`${product.naam} - ${v.naam}`);
  } else if (product.voorraad === 0) {
    uitverkochtMeldingen.push(product.naam);
  }

  objecten.push({
    id: itemId,
    type: "ITEM",
    itemData: {
      name: product.naam,
      descriptionHtml,
      categories: categorieen_,
      itemOptions: heeftVarianten ? [{ itemOptionId: kleurOptieId }] : undefined,
      variations,
    },
  });
  itemPlannen.push({ slug: product.slug, itemId, afbeeldingen: product.afbeeldingen });
}

/* -------------------------------------------------------------------------- */
/* Stap 4: uitvoeren                                                            */
/* -------------------------------------------------------------------------- */

async function uploadAfbeeldingen(realItemIdBySlug: Map<string, string>) {
  let gedaan = 0;
  const totaal = itemPlannen.reduce((n, p) => n + p.afbeeldingen.length, 0);
  for (const plan of itemPlannen) {
    const realItemId = realItemIdBySlug.get(plan.itemId);
    if (!realItemId) {
      console.warn(`Geen echte id voor ${plan.slug}, afbeeldingen overgeslagen.`);
      continue;
    }
    for (let i = 0; i < plan.afbeeldingen.length; i++) {
      const bestand = path.join(process.cwd(), "public", plan.afbeeldingen[i]);
      if (!fs.existsSync(bestand)) {
        console.warn(`Bestand ontbreekt: ${bestand}`);
        continue;
      }
      // Square accepteert JPEG, PNG en GIF; onze foto's zijn WebP. Uitsnedes
      // met transparantie krijgen daarbij een witte achtergrond.
      const buffer = await sharp(bestand).flatten({ background: "#ffffff" }).jpeg({ quality: 88 }).toBuffer();
      const blob = new Blob([new Uint8Array(buffer)], { type: "image/jpeg" });
      try {
        await client.catalog.images.create({
          request: {
            idempotencyKey: `img-${plan.slug}-${i}-${Date.now()}`,
            objectId: realItemId,
            // Het lokale pad als bijschrift: zo toont de website haar eigen (bijgesneden)
            // foto in plaats van de Square-kopie; zie fotoUitSquare() in catalog.server.ts.
            image: { type: "IMAGE", id: "#tempimage", imageData: { caption: plan.afbeeldingen[i] } } as never,
            isPrimary: i === 0,
          },
          imageFile: blob as never,
        });
      } catch (err: unknown) {
        const e = err as { body?: unknown };
        console.error(`Afbeelding mislukt voor ${plan.slug} (${plan.afbeeldingen[i]}):`, JSON.stringify(e.body ?? err));
      }
      gedaan++;
      if (gedaan % 20 === 0) console.log(`Afbeeldingen: ${gedaan}/${totaal}`);
    }
  }
  console.log(`Afbeeldingen klaar: ${gedaan}/${totaal}`);
}

async function main() {
  console.log(`Omgeving: ${isProductie ? "production" : "sandbox"}, valuta ${VALUTA}, ${producten.length} artikelen.`);
  const accountValuta = (await client.merchants.get({ merchantId: "me" })).merchant?.currency;
  if (accountValuta !== VALUTA) {
    console.error(`De account rekent in ${accountValuta}, dit script in ${VALUTA}. Zet SQUARE_CURRENCY=${accountValuta} in .env.local.`);
    process.exit(1);
  }
  if (WIS_EERST) await wisCatalogus();

  console.log(`Verstuur ${objecten.length} catalogusobjecten (categorieen, kleuropties, producten)...`);
  const res = await client.catalog.batchUpsert({
    idempotencyKey: `ukm-sync-${Date.now()}`,
    batches: [{ objects: objecten as never }],
  });
  if (res.errors && res.errors.length > 0) {
    console.error("Fouten bij batch-upsert:", JSON.stringify(res.errors, null, 2));
    process.exit(1);
  }
  console.log("Aangemaakt:", res.objects?.length ?? 0);

  const realItemIdBySlug = new Map<string, string>();
  for (const mapping of res.idMappings ?? []) {
    if (mapping.clientObjectId && mapping.objectId) {
      realItemIdBySlug.set(mapping.clientObjectId, mapping.objectId);
    }
  }

  if (MET_FOTOS) {
    console.log("Upload productfoto's (dit duurt enkele minuten)...");
    await uploadAfbeeldingen(realItemIdBySlug);
  } else {
    console.log("Foto's overgeslagen (gebruik --met-fotos om ze ook te uploaden).");
  }

  if (uitverkochtMeldingen.length > 0) {
    console.log("\nIn de prijslijst als 'Sold out' afgestempeld; staan in Square met voorraadtelling aan en 0 op voorraad:");
    for (const naam of uitverkochtMeldingen) console.log(`  - ${naam}`);
  }
  console.log("Sync voltooid.");
}

main().catch((err) => {
  console.error("Sync mislukt:");
  console.error(JSON.stringify(err.body ?? err, null, 2));
  process.exit(1);
});
