/**
 * Volledige, herhaalbare sync van het ECHTE UKM-assortiment naar Square.
 *
 * Dit vervangt de eerdere steekproef-only `square-catalog-seed.ts` (Fase 0,
 * bewust een kleine test) met een volledige import van alle 107 echte
 * producten uit data/catalogus/brillen.ts + lenzen.ts, inclusief echte
 * productfoto's. Werkt de sandbox-catalogus bij; wist eerst wat er nu in
 * staat (uitsluitend onze eigen eerdere testdata uit Fase 0, geen echte
 * klantgegevens) zodat dit script herhaalbaar is zonder duplicaten.
 *
 * Eerlijkheids-beslissingen (zie ook docs/square-mapping-notes.md):
 * - Voorraad wordt NIET gesynchroniseerd als verzonnen aantal. Elke variatie
 *   krijgt `trackInventory: false` (altijd besteltbaar), tot UKM echte
 *   aantallen invoert in het Square-dashboard. Geen nepgetallen als "nog 3
 *   op voorraad".
 * - Populariteit/"toegevoegdOp" komen niet meer uit een hash-functie. Nieuw
 *   binnen/bestseller worden alleen gezet als dat expliciet in de brondata
 *   staat (`labels: [...]` in brillen.ts/lenzen.ts) - dat is echte redactionele
 *   curatie, geen verzonnen data. "Nieuw binnen" op basis van datum komt
 *   voortaan uit Square's eigen `createdAt`.
 * - De specificatietabel laat velden weg die willekeurig per product waren
 *   gegenereerd (blauwlichtfilter-percentage, glas-/brug-/veerbreedte,
 *   gewicht, draagduur). Alleen vaste, echte feiten uit de prijslijst blijven
 *   over en gaan als tekst in descriptionHtml (Square heeft geen los
 *   spec-tabelveld).
 * - Vanaf-prijs (sale/was-prijs) wordt NIET gesynchroniseerd: dat vereist een
 *   custom attribute op ITEM_VARIATION en die blijven leeg door een
 *   geconfirmeerd Square-platformprobleem (zie docs/square-mapping-notes.md,
 *   bevinding 8, en de gemelde bug op het Square-forum). Blijft zo tot
 *   Square dat oplost.
 *
 *   npx tsx scripts/square-catalog-sync.ts
 */
import process from "node:process";
import fs from "node:fs";
import path from "node:path";
import { SquareClient, SquareEnvironment } from "square";

import { brillenInvoer } from "../data/catalogus/brillen";
import { lenzenInvoer } from "../data/catalogus/lenzen";
import { hoofdcategorieen, categorieen } from "../data/categorieen";
import { merken } from "../data/merken";
import { vormprofielen, techniekprofielen, kleurprofielen } from "../data/catalogus/gemeenschappelijk";

process.loadEnvFile(".env.local");

const token = process.env.SQUARE_ACCESS_TOKEN;
if (!token) {
  console.error("SQUARE_ACCESS_TOKEN ontbreekt in .env.local.");
  process.exit(1);
}

const SANDBOX_CURRENCY = "USD";

const client = new SquareClient({
  token,
  environment: process.env.SQUARE_ENVIRONMENT === "production" ? SquareEnvironment.Production : SquareEnvironment.Sandbox,
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
 * opslaan en strip elk data-attribuut dat hier ooit op de <ul>'s stond
 * (geverifieerd tegen de sandbox), dus alleen de volgorde is betrouwbaar.
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
/* Stap 0: sandbox leegmaken (alleen onze eigen Fase-0 testdata)               */
/* -------------------------------------------------------------------------- */

async function wisCatalogus() {
  const ids: string[] = [];
  const pagina = await client.catalog.list();
  for await (const obj of pagina) if (obj.id) ids.push(obj.id);
  if (ids.length === 0) {
    console.log("Sandbox-catalogus is al leeg.");
    return;
  }
  for (let i = 0; i < ids.length; i += 200) {
    await client.catalog.batchDelete({ objectIds: ids.slice(i, i + 200) });
  }
  console.log(`Verwijderd: ${ids.length} bestaande objecten uit de sandbox.`);
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
/* Stap 2: kleur item-optie (gedeeld over alle brillen met varianten)          */
/* -------------------------------------------------------------------------- */

const kleurOptieId = tempId("itemopt");
// Square staat maar een waarde per naam toe binnen een item-optie; de kleurnaam
// (niet de exacte hex) is de dedup-sleutel. Enkele producten gebruiken een
// licht andere hex voor dezelfde kleurnaam (bijv. "Zwart" #1b1b1b vs #2b2b2f) -
// de eerst geziene hex wint, het verschil is visueel verwaarloosbaar.
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

for (const invoer of brillenInvoer) {
  for (const variant of invoer.varianten ?? []) {
    kleurWaardeId(variant.naam, variant.swatch);
  }
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
  afbeeldingen: string[]; // publieke paden, bijv. "/producten/brillen/brillen-p004-1.jpg"
}
const itemPlannen: ItemPlan[] = [];

function brilMerkSlug(techniek: string, vorm: string, prijs: number): string {
  if (vorm === "kids") return "ukm-kids";
  if (techniek !== "ptc") return "ukm-clear";
  return prijs >= 750 ? "ukm-signature" : "ukm-ptc";
}

function merkNaam(slug: string): string {
  return merken.find((m) => m.slug === slug)?.naam ?? slug;
}

function curatedLabelCategorieen(labels: string[] | undefined): string[] {
  const ids: string[] = [];
  if (!labels) return ids;
  if (labels.includes("bestseller")) ids.push(facetCategorie("Label", "Bestseller"));
  if (labels.includes("nieuw")) ids.push(facetCategorie("Label", "Nieuw"));
  if (labels.includes("aanbieding")) ids.push(facetCategorie("Label", "Aanbieding"));
  return ids;
}

for (const invoer of brillenInvoer) {
  const vorm = vormprofielen[invoer.vorm];
  const techniek = techniekprofielen[invoer.techniek];
  const categorieSlug = invoer.vorm === "kids" ? "kinderbrillen" : invoer.techniek === "ptc" ? "ptc" : "anti-blauwlicht";
  const merkSlug = brilMerkSlug(invoer.techniek, invoer.vorm, invoer.prijs);

  const beschrijvingAlineas = [
    `${invoer.naam} is uitgevoerd in ${invoer.kleur.toLowerCase()}, op een montuur van ${invoer.materiaal.toLowerCase()}.`,
    vorm.karakter,
    techniek.tekst,
    vorm.pasvorm,
  ];
  const kenmerken = [...techniek.kenmerken, "Lichtgewicht montuur met veerscharnieren", "Antikras-coating op beide glaszijden", "Inclusief hoes en microvezeldoekje"];
  const specificaties = [
    ["Montuurvorm", vorm.naam],
    ["Glastype", invoer.techniek === "ptc" ? "Photochroom (PTC)" : "Helder, anti-blauwlicht"],
    ["UV-bescherming", invoer.techniek === "ptc" ? "UV400" : "UV380"],
    ["Montuurmateriaal", invoer.materiaal],
    ["Meegeleverd", "Brillenhoes en poetsdoekje"],
  ];

  const descriptionHtml = bouwDescriptionHtml(invoer.intro, beschrijvingAlineas, kenmerken, specificaties as [string, string][]);

  const categorieId = categorieIdBySlug.get(categorieSlug);
  const categorieen_: { id: string }[] = [];
  if (categorieId) categorieen_.push({ id: categorieId });
  categorieen_.push({ id: facetCategorie("Techniek", invoer.techniek === "ptc" ? "PTC" : "Non-PTC") });
  categorieen_.push({ id: facetCategorie("Vorm", vorm.naam) });
  categorieen_.push({ id: facetCategorie("Merk", merkNaam(merkSlug)) });
  // De echte, mens-leesbare slug is niet betrouwbaar terug te leiden uit de
  // naam alleen (handmatige ontdubbelaars zoals "-clear", "-l038"), dus die
  // gaat mee als eigen facet-categorie - dezelfde bewezen-werkende route als
  // de andere assen, alleen dan 1-op-1 in plaats van gedeeld.
  categorieen_.push({ id: facetCategorie("Slug", invoer.slug) });
  for (const id of curatedLabelCategorieen(invoer.labels)) categorieen_.push({ id });

  const heeftVarianten = (invoer.varianten ?? []).length > 0;
  const itemId = tempId("item");
  const variations = heeftVarianten
    ? invoer.varianten!.map((variant) => ({
        id: tempId("variant"),
        type: "ITEM_VARIATION",
        itemVariationData: {
          itemId,
          name: variant.naam,
          sku: `${invoer.slug}-${variant.id}`,
          pricingType: "FIXED_PRICING",
          priceMoney: { amount: BigInt(Math.round((variant.prijs ?? invoer.prijs) * 100)), currency: SANDBOX_CURRENCY },
          trackInventory: false,
          sellable: true,
          stockable: true,
          itemOptionValues: [{ itemOptionId: kleurOptieId, itemOptionValueId: kleurWaardeId(variant.naam, variant.swatch) }],
        },
      }))
    : [
        {
          id: tempId("variant"),
          type: "ITEM_VARIATION",
          itemVariationData: {
            itemId,
            name: "Standaard",
            sku: invoer.slug,
            pricingType: "FIXED_PRICING",
            priceMoney: { amount: BigInt(Math.round(invoer.prijs * 100)), currency: SANDBOX_CURRENCY },
            trackInventory: false,
            sellable: true,
            stockable: true,
          },
        },
      ];

  objecten.push({
    id: itemId,
    type: "ITEM",
    itemData: {
      name: invoer.naam,
      descriptionHtml,
      categories: categorieen_,
      itemOptions: heeftVarianten ? [{ itemOptionId: kleurOptieId }] : undefined,
      variations,
    },
  });
  itemPlannen.push({ slug: invoer.slug, itemId, afbeeldingen: invoer.afbeeldingen });
}

for (const invoer of lenzenInvoer) {
  const kleur = kleurprofielen[invoer.kleur];
  const opSterkte = invoer.sterktesoort === "met-sterkte";
  const categorieSlug = opSterkte ? "lenzen-met-sterkte" : "lenzen-zonder-sterkte";
  const merkSlug = opSterkte ? "ukm-vision" : "ukm-soft-lenses";

  const beschrijvingAlineas = [
    `${invoer.naam}${invoer.code ? ` (${invoer.code})` : ""} is een zachte kleurlens ${
      opSterkte
        ? `die corrigeert en verkleurt in een enkele lens, leverbaar in sterkte ${invoer.sterktebereik.toLowerCase()}`
        : "zonder sterkte, puur bedoeld om de oogkleur te veranderen"
    }.`,
    kleur.tekst,
    "Een set bestaat uit twee lenzen in steriele vloeistof, na openen zes maanden houdbaar. Het materiaal bevat 38 tot 42 procent water, waardoor de lens de hele dag soepel blijft.",
    "Draag lenzen nooit langer dan aanbevolen door je opticien en volg de hygieneregels die bij elke bestelling worden meegeleverd.",
  ];
  const kenmerken = [
    opSterkte ? `Leverbaar op sterkte ${invoer.sterktebereik.toLowerCase()}` : "Zonder sterkte, voor iedereen",
    "Zacht en comfortabel om te dragen",
    "Natuurlijk kleurverloop met zachte rand",
    "FDA, GMP, ISO en CE goedgekeurd",
    "Zes maanden houdbaar na openen",
  ];
  const specificaties = [
    ["Diameter (DIA)", "14.0 - 14.5 mm"],
    ["Basiscurve", "8.6 mm"],
    ["Sterkte", invoer.sterktebereik],
    ["Watergehalte", "38% - 42%"],
    ["Materiaal", "58% - 62% PHEMA"],
    ["Houdbaarheid", "6 maanden na openen"],
    ["Verpakking", "Set van 2 lenzen in steriele vloeistof"],
    ["Certificering", "FDA, GMP, ISO en CE goedgekeurd"],
  ];

  const descriptionHtml = bouwDescriptionHtml(invoer.intro, beschrijvingAlineas, kenmerken, specificaties as [string, string][]);

  const categorieId = categorieIdBySlug.get(categorieSlug);
  const categorieen_: { id: string }[] = [];
  if (categorieId) categorieen_.push({ id: categorieId });
  categorieen_.push({ id: facetCategorie("Sterktesoort", opSterkte ? "Met sterkte" : "Zonder sterkte") });
  categorieen_.push({ id: facetCategorie("Kleurfamilie", kleur.familie) });
  categorieen_.push({ id: facetCategorie("Merk", merkNaam(merkSlug)) });
  categorieen_.push({ id: facetCategorie("Slug", invoer.slug) });
  for (const id of curatedLabelCategorieen(invoer.labels)) categorieen_.push({ id });

  const itemId = tempId("item");
  objecten.push({
    id: itemId,
    type: "ITEM",
    itemData: {
      name: invoer.naam,
      descriptionHtml,
      categories: categorieen_,
      variations: [
        {
          id: tempId("variant"),
          type: "ITEM_VARIATION",
          itemVariationData: {
            itemId,
            name: "Standaard",
            sku: invoer.slug,
            pricingType: "FIXED_PRICING",
            priceMoney: { amount: BigInt(Math.round(invoer.prijs * 100)), currency: SANDBOX_CURRENCY },
            trackInventory: false,
            sellable: true,
            stockable: true,
          },
        },
      ],
    },
  });
  itemPlannen.push({ slug: invoer.slug, itemId, afbeeldingen: invoer.afbeeldingen });
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
      const buffer = fs.readFileSync(bestand);
      const blob = new Blob([buffer], { type: "image/jpeg" });
      try {
        await client.catalog.images.create({
          request: {
            idempotencyKey: `img-${plan.slug}-${i}-${Date.now()}`,
            objectId: realItemId,
            image: { type: "IMAGE", id: "#tempimage", imageData: { caption: plan.slug } } as never,
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
  await wisCatalogus();

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

  console.log("Upload productfoto's (dit duurt enkele minuten)...");
  await uploadAfbeeldingen(realItemIdBySlug);

  console.log("Sync voltooid.");
}

main().catch((err) => {
  console.error("Sync mislukt:");
  console.error(JSON.stringify(err.body ?? err, null, 2));
  process.exit(1);
});
