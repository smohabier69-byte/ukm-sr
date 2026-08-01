/**
 * Eenmalig, alleen-lezen verkenningsscript voor de Square sandbox-catalogus.
 * Dumpt de ruwe catalogus- en voorraadrespons naar JSON zodat we UKM's
 * taxonomie (techniek, sterktesoort, vorm, kleur, merk) tegen de echte
 * Square-primitieven kunnen leggen in plaats van te gokken.
 *
 *   node --env-file=.env.local scripts/square-catalog-explore.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SquareClient, SquareEnvironment } from "square";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_FILE = path.join(ROOT, "scripts", "square-catalog-raw.json");

const token = process.env.SQUARE_ACCESS_TOKEN;
const locationId = process.env.SQUARE_LOCATION_ID;

if (!token) {
  console.error("SQUARE_ACCESS_TOKEN ontbreekt. Vul .env.local in en run met --env-file=.env.local.");
  process.exit(1);
}

const client = new SquareClient({
  token,
  environment:
    process.env.SQUARE_ENVIRONMENT === "production" ? SquareEnvironment.Production : SquareEnvironment.Sandbox,
});

const OBJECT_TYPES = ["ITEM", "CATEGORY", "ITEM_OPTION", "ITEM_OPTION_VAL", "CUSTOM_ATTRIBUTE_DEFINITION", "IMAGE"];

async function main() {
  console.log(`Omgeving: ${process.env.SQUARE_ENVIRONMENT ?? "sandbox"}`);

  const objecten = [];
  let cursor;
  do {
    const res = await client.catalog.search({
      objectTypes: OBJECT_TYPES,
      includeRelatedObjects: true,
      cursor,
    });
    objecten.push(...(res.objects ?? []));
    if (res.relatedObjects) objecten.push(...res.relatedObjects);
    cursor = res.cursor;
  } while (cursor);

  console.log(`Catalogusobjecten opgehaald: ${objecten.length}`);
  const perType = {};
  for (const o of objecten) perType[o.type] = (perType[o.type] ?? 0) + 1;
  console.log("Per type:", perType);

  let voorraad = null;
  if (locationId) {
    const itemVariationIds = objecten
      .filter((o) => o.type === "ITEM_VARIATION")
      .map((o) => o.id)
      .slice(0, 100);
    if (itemVariationIds.length) {
      const res = await client.inventory.batchGetCounts({
        catalogObjectIds: itemVariationIds,
        locationIds: [locationId],
      });
      voorraad = [];
      for await (const pagina of res) voorraad.push(pagina);
    }
  } else {
    console.warn("SQUARE_LOCATION_ID ontbreekt, voorraadrespons wordt overgeslagen.");
  }

  fs.writeFileSync(
    OUT_FILE,
    JSON.stringify({ opgehaaldOp: new Date().toISOString(), objecten, voorraad }, null, 2),
  );
  console.log(`Weggeschreven naar ${path.relative(ROOT, OUT_FILE)}`);
  console.log(
    "\nHandmatig na te kijken in het uitvoerbestand: merk-representatie, geneste categorieën, " +
      "hex-waarde op kleur-item-opties, custom attribute definitions, en de host in image_url.",
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
