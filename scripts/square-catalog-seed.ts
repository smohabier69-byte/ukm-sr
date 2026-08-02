/**
 * Zet een representatieve doorsnede van het ECHTE UKM-assortiment (uit
 * data/producten.ts, zelf ooit uit de officiele prijslijst-PDF's gehaald) in
 * de Square-sandbox. Geen verzonnen testproducten - dit dient om de
 * taxonomie-mapping (Fase 2) tegen echte Square-primitieven te toetsen
 * voordat die definitief wordt vastgelegd.
 *
 *   npx tsx scripts/square-catalog-seed.ts
 */
import process from "node:process";
import { SquareClient, SquareEnvironment } from "square";

import { producten } from "../data/producten";
import { merken } from "../data/merken";
import { categorieen, hoofdcategorieen } from "../data/categorieen";
import type { Product } from "../types/product";

process.loadEnvFile(".env.local");

const token = process.env.SQUARE_ACCESS_TOKEN;
if (!token) {
  console.error("SQUARE_ACCESS_TOKEN ontbreekt in .env.local.");
  process.exit(1);
}

/**
 * De prijzen in de sandbox moeten in de valuta van het testaccount staan
 * (Square wees SRD af: "merchant currency USD - currency in request SRD").
 * Dit is een sandbox-testaccount-instelling, geen bevestiging dat het
 * echte Square-account van de eigenaar ook USD is - dat blijft een open
 * vraag voor Fase 2/9: ondersteunt Square uberhaupt SRD, en zo niet, in
 * welke valuta rekent UKM's echte account dan af?
 */
const SANDBOX_CURRENCY = "USD";

const client = new SquareClient({
  token,
  environment: process.env.SQUARE_ENVIRONMENT === "production" ? SquareEnvironment.Production : SquareEnvironment.Sandbox,
});

/** Kiest een representatieve, echte doorsnede: elke techniek/sterktesoort/vorm-as komt minstens eenmaal voor. */
function kiesSteekproef(): Product[] {
  const ptcMetVariant = producten.find((p) => p.techniek === "ptc" && p.varianten.length > 0);
  const ptcSimple = producten.find((p) => p.techniek === "ptc" && p.varianten.length === 0 && p !== ptcMetVariant);
  const nonPtc = producten.find((p) => p.techniek === "non-ptc");
  const kids = producten.find((p) => p.vorm === "kids");
  const lenzenMet = producten.filter((p) => p.sterktesoort === "met-sterkte").slice(0, 2);
  const lenzenZonder = producten.filter((p) => p.sterktesoort === "zonder-sterkte").slice(0, 2);

  const kandidaten = [ptcMetVariant, ptcSimple, nonPtc, kids, ...lenzenMet, ...lenzenZonder].filter(
    (p): p is Product => p !== undefined,
  );
  const gezien = new Set<string>();
  return kandidaten.filter((p) => (gezien.has(p.slug) ? false : (gezien.add(p.slug), true)));
}

/**
 * Square's `color`-veld accepteert alleen 6-cijferige hex ZONDER "#" en
 * ZONDER alfakanaal - getest en bevestigd tegen de sandbox. De SDK-typen
 * geven zelf een voorbeeld met "#" en alfa ("#ff8d4e85"), maar dat wordt
 * afgewezen; dit is dus geverifieerd gedrag, geen aanname.
 */
function naarSquareHex(hex: string): string {
  return hex.replace(/^#/, "").slice(0, 6);
}

const steekproef = kiesSteekproef();
console.log(
  "Echte producten in de steekproef:",
  steekproef.map((p) => `${p.slug} (${p.techniek ?? p.sterktesoort}, ${p.varianten.length} varianten)`),
);

let temp = 0;
const nieuweId = (prefix: string) => `#${prefix}-${++temp}`;

const objecten: Record<string, unknown>[] = [];

// --- Categorieen: ouder + kind, om geneste categorieen te toetsen (Fase 0, vraag 2) ---
const categorieIdBySlug = new Map<string, string>();
for (const hoofd of hoofdcategorieen) {
  const id = nieuweId("cat");
  categorieIdBySlug.set(hoofd.slug, id);
  objecten.push({
    id,
    type: "CATEGORY",
    categoryData: { name: hoofd.naam, categoryType: "REGULAR_CATEGORY" },
  });
}
const gebruikteCategorieSlugs = new Set(steekproef.map((p) => p.categorie));
for (const cat of categorieen) {
  if (!gebruikteCategorieSlugs.has(cat.slug)) continue;
  const ouderSlug = hoofdcategorieen.find((h) => h.subcategorieen.includes(cat.slug))?.slug;
  const id = nieuweId("cat");
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

// --- Custom attribute definities: techniek, sterktesoort, vorm, kleurfamilie, merk ---
function selectieDefinitie(
  naam: string,
  key: string,
  waarden: string[],
): { id: string; uidPerWaarde: Map<string, string> } {
  const id = nieuweId("attr");
  const uidPerWaarde = new Map(waarden.map((w) => [w, `#${key}-${w}`]));
  objecten.push({
    id,
    type: "CUSTOM_ATTRIBUTE_DEFINITION",
    customAttributeDefinitionData: {
      type: "SELECTION",
      name: naam,
      key,
      allowedObjectTypes: ["ITEM"],
      sellerVisibility: "SELLER_VISIBILITY_READ_WRITE_VALUES",
      selectionConfig: {
        allowedSelections: waarden.map((w) => ({ uid: uidPerWaarde.get(w), name: w })),
      },
    },
  });
  return { id, uidPerWaarde };
}

const technieken = [...new Set(steekproef.map((p) => p.techniek).filter(Boolean))] as string[];
const sterktesoorten = [...new Set(steekproef.map((p) => p.sterktesoort).filter(Boolean))] as string[];
const vormen = [...new Set(steekproef.map((p) => p.vorm).filter(Boolean))] as string[];
const kleurfamilies = [...new Set(steekproef.map((p) => p.kleurfamilie).filter(Boolean))] as string[];
const merkSlugs = [...new Set(steekproef.map((p) => p.merk))];

const techniekDef = selectieDefinitie("Techniek", "techniek", technieken);
const sterkteDef = selectieDefinitie("Sterktesoort", "sterktesoort", sterktesoorten);
const vormDef = selectieDefinitie("Montuurvorm", "montuurvorm", vormen);
const kleurDef = selectieDefinitie("Kleurfamilie", "kleurfamilie", kleurfamilies);
const merkDef = selectieDefinitie(
  "Merk",
  "merk",
  merkSlugs.map((s) => merken.find((m) => m.slug === s)?.naam ?? s),
);
const merkNaamPerSlug = new Map(merkSlugs.map((s) => [s, merken.find((m) => m.slug === s)?.naam ?? s]));

// Sale/"vanaf"-prijs: Square heeft geen natuurlijk was/nu-veld op een variatie (Fase 0, vraag 6).
const vanafPrijsDef = nieuweId("attr");
objecten.push({
  id: vanafPrijsDef,
  type: "CUSTOM_ATTRIBUTE_DEFINITION",
  customAttributeDefinitionData: {
    type: "NUMBER",
    name: "Vanaf-prijs",
    key: "vanaf_prijs",
    allowedObjectTypes: ["ITEM_VARIATION"],
    sellerVisibility: "SELLER_VISIBILITY_READ_WRITE_VALUES",
  },
});

// --- Kleur-item-optie, om te toetsen of de hex-swatch native meekomt (Fase 0, vraag 3) ---
const kleurOptieId = nieuweId("itemopt");
const kleurWaardeIdPerVariant = new Map<string, string>();
const kleurWaarden: Record<string, unknown>[] = [];
for (const product of steekproef) {
  for (const variant of product.varianten) {
    if (kleurWaardeIdPerVariant.has(variant.id)) continue;
    const id = nieuweId("itemoptval");
    kleurWaardeIdPerVariant.set(variant.id, id);
    kleurWaarden.push({
      id,
      type: "ITEM_OPTION_VAL",
      itemOptionValueData: { itemOptionId: kleurOptieId, name: variant.naam, color: naarSquareHex(variant.swatch) },
    });
  }
}
if (kleurWaarden.length > 0) {
  objecten.push({
    id: kleurOptieId,
    type: "ITEM_OPTION",
    itemOptionData: { name: "Kleur", displayName: "Kleur", showColors: true },
  });
  objecten.push(...kleurWaarden);
}

// --- De echte producten zelf ---
for (const product of steekproef) {
  const itemId = nieuweId("item");
  const categorieId = categorieIdBySlug.get(product.categorie);

  const customAttributeValues: Record<string, unknown> = {};
  if (product.techniek) {
    customAttributeValues[techniekDef.id] = {
      customAttributeDefinitionId: techniekDef.id,
      type: "SELECTION",
      selectionUidValues: [techniekDef.uidPerWaarde.get(product.techniek)],
    };
  }
  if (product.sterktesoort) {
    customAttributeValues[sterkteDef.id] = {
      customAttributeDefinitionId: sterkteDef.id,
      type: "SELECTION",
      selectionUidValues: [sterkteDef.uidPerWaarde.get(product.sterktesoort)],
    };
  }
  if (product.vorm) {
    customAttributeValues[vormDef.id] = {
      customAttributeDefinitionId: vormDef.id,
      type: "SELECTION",
      selectionUidValues: [vormDef.uidPerWaarde.get(product.vorm)],
    };
  }
  if (product.kleurfamilie) {
    customAttributeValues[kleurDef.id] = {
      customAttributeDefinitionId: kleurDef.id,
      type: "SELECTION",
      selectionUidValues: [kleurDef.uidPerWaarde.get(product.kleurfamilie)],
    };
  }
  customAttributeValues[merkDef.id] = {
    customAttributeDefinitionId: merkDef.id,
    type: "SELECTION",
    selectionUidValues: [merkDef.uidPerWaarde.get(merkNaamPerSlug.get(product.merk) ?? product.merk)],
  };

  const heeftVarianten = product.varianten.length > 0;
  const variations = heeftVarianten
    ? product.varianten.map((variant) => ({
        id: nieuweId("variant"),
        type: "ITEM_VARIATION",
        itemVariationData: {
          itemId,
          name: variant.naam,
          sku: `${product.id}-${variant.id}`,
          pricingType: "FIXED_PRICING",
          priceMoney: { amount: BigInt(Math.round((variant.prijs ?? product.prijs) * 100)), currency: SANDBOX_CURRENCY },
          itemOptionValues: [{ itemOptionId: kleurOptieId, itemOptionValueId: kleurWaardeIdPerVariant.get(variant.id) }],
          customAttributeValues: product.vanPrijs
            ? {
                [vanafPrijsDef]: {
                  customAttributeDefinitionId: vanafPrijsDef,
                  type: "NUMBER",
                  numberValue: String(product.vanPrijs),
                },
              }
            : undefined,
        },
      }))
    : [
        {
          id: nieuweId("variant"),
          type: "ITEM_VARIATION",
          itemVariationData: {
            itemId,
            name: "Standaard",
            sku: product.id,
            pricingType: "FIXED_PRICING",
            priceMoney: { amount: BigInt(Math.round(product.prijs * 100)), currency: SANDBOX_CURRENCY },
            customAttributeValues: product.vanPrijs
              ? {
                  [vanafPrijsDef]: {
                    customAttributeDefinitionId: vanafPrijsDef,
                    type: "NUMBER",
                    numberValue: String(product.vanPrijs),
                  },
                }
              : undefined,
          },
        },
      ];

  objecten.push({
    id: itemId,
    type: "ITEM",
    itemData: {
      name: product.naam,
      descriptionHtml: `<p>${product.korteBeschrijving}</p>`,
      categories: categorieId ? [{ id: categorieId }] : undefined,
      itemOptions: heeftVarianten ? [{ itemOptionId: kleurOptieId }] : undefined,
      variations,
      customAttributeValues,
    },
  });
}

async function main() {
  console.log(`Verstuur ${objecten.length} catalogusobjecten naar de sandbox...`);
  const res = await client.catalog.batchUpsert({
    idempotencyKey: `ukm-seed-${Date.now()}`,
    batches: [{ objects: objecten as never }],
  });
  console.log("Aangemaakt:", res.objects?.length ?? 0);
  if (res.idMappings) {
    console.log("Voorbeeld id-mapping:", res.idMappings.slice(0, 3));
  }
}

main().catch((err) => {
  console.error("Seeden mislukt:");
  console.error(JSON.stringify(err.body ?? err, null, 2));
  process.exit(1);
});
