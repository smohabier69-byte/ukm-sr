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
 *
 * LET OP: sinds de overstap naar de prijslijsten van november 2026 is dit
 * script nog niet tegen de nieuwe Square-account gedraaid. Draai het eerst
 * tegen een lege of sandbox-account en controleer het resultaat.
 *
 * Beslissingen (zie ook docs/square-mapping-notes.md):
 * - Voorraad wordt niet als verzonnen aantal gesynchroniseerd. Elke variatie
 *   krijgt `trackInventory: false` (altijd bestelbaar). Artikelen die de
 *   prijslijst als "Sold out" afstempelt, moeten in het Square-dashboard zelf
 *   op voorraad 0 worden gezet (voorraadtelling aan, aantal 0); dit script
 *   meldt welke dat zijn.
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
  const ids: string[] = [];
  const pagina = await client.catalog.list();
  for await (const obj of pagina) if (obj.id) ids.push(obj.id);
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

function variatie(itemId: string, naam: string, sku: string, prijs: number, optie?: { naam: string; swatch: string }) {
  return {
    id: tempId("variant"),
    type: "ITEM_VARIATION",
    itemVariationData: {
      itemId,
      name: naam,
      sku,
      pricingType: "FIXED_PRICING",
      priceMoney: { amount: BigInt(Math.round(prijs * 100)), currency: VALUTA },
      trackInventory: false,
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
    categorieen_.push({ id: facetCategorie("Techniek", product.techniek === "ptc" ? "PTC" : "Non-PTC") });
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
        variatie(itemId, v.naam, `${product.slug}-${v.id}`, v.prijs ?? product.prijs, { naam: v.naam, swatch: v.swatch }),
      )
    : [variatie(itemId, "Standaard", product.slug, product.prijs)];

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
  console.log(`Omgeving: ${isProductie ? "production" : "sandbox"}, valuta ${VALUTA}, ${producten.length} artikelen.`);
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

  console.log("Upload productfoto's (dit duurt enkele minuten)...");
  await uploadAfbeeldingen(realItemIdBySlug);

  if (uitverkochtMeldingen.length > 0) {
    console.log("\nIn de prijslijst als 'Sold out' afgestempeld - zet deze in het Square-dashboard op voorraad 0:");
    for (const naam of uitverkochtMeldingen) console.log(`  - ${naam}`);
  }
  console.log("Sync voltooid.");
}

main().catch((err) => {
  console.error("Sync mislukt:");
  console.error(JSON.stringify(err.body ?? err, null, 2));
  process.exit(1);
});
