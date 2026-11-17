/**
 * Zet voorraadtelling aan voor elke UKM-variatie in Square die nog geen telling
 * heeft, met een standaardaantal (default 10) als startpunt. De eigenaar past de
 * aantallen daarna aan in het Square-dashboard. Variaties die al geteld worden
 * (bijv. uitverkocht = 0) blijven onaangeroerd. Pink by Moon-artikelen (andere
 * winkel, zelfde account) worden overgeslagen.
 *
 *   node scripts/square-voorraad-standaard.mjs              (droog)
 *   node scripts/square-voorraad-standaard.mjs --echt [--aantal=10]
 */
import crypto from "node:crypto";
import process from "node:process";
import { SquareClient, SquareEnvironment } from "square";

process.loadEnvFile(".env.local");
const ECHT = process.argv.includes("--echt");
const AANTAL = Number(process.argv.find((a) => a.startsWith("--aantal="))?.split("=")[1] ?? 10);
const LOCATIE = process.env.SQUARE_LOCATION_ID;

const client = new SquareClient({
  token: process.env.SQUARE_ACCESS_TOKEN,
  environment: process.env.SQUARE_ENVIRONMENT === "production" ? SquareEnvironment.Production : SquareEnvironment.Sandbox,
});

const pinkCategorieen = new Set();
const items = [];
for await (const o of await client.catalog.list({ types: "CATEGORY,ITEM" })) {
  if (o.type === "CATEGORY" && (o.categoryData?.name === "Pink by Moon" || o.categoryData?.name?.startsWith("Pink: "))) pinkCategorieen.add(o.id);
  if (o.type === "ITEM") items.push(o);
}

const aanTePassen = items
  .filter((o) => !(o.itemData?.categories ?? []).some((c) => pinkCategorieen.has(c.id)))
  .filter((o) => (o.itemData?.variations ?? []).some((v) => !v.itemVariationData?.trackInventory));
const variaties = aanTePassen.flatMap((o) => o.itemData.variations.filter((v) => !v.itemVariationData?.trackInventory));
console.log(`${aanTePassen.length} artikelen, ${variaties.length} variaties zonder telling; worden ${AANTAL} op voorraad. ${ECHT ? "ECHT" : "droog"}`);
if (!ECHT) process.exit(0);

// 1. Telling aanzetten (hele item-objecten terugsturen met hun huidige versie).
for (const o of aanTePassen) for (const v of o.itemData.variations) if (!v.itemVariationData.trackInventory) v.itemVariationData.trackInventory = true;
for (let i = 0; i < aanTePassen.length; i += 100) {
  const res = await client.catalog.batchUpsert({ idempotencyKey: crypto.randomUUID(), batches: [{ objects: aanTePassen.slice(i, i + 100) }] });
  if (res.errors?.length) throw new Error(JSON.stringify(res.errors));
}
console.log("Voorraadtelling aangezet.");

// 2. Startaantal zetten.
const nu = new Date().toISOString();
const tellingen = variaties.map((v) => ({
  type: "PHYSICAL_COUNT",
  physicalCount: { catalogObjectId: v.id, locationId: LOCATIE, state: "IN_STOCK", quantity: String(AANTAL), occurredAt: nu },
}));
for (let i = 0; i < tellingen.length; i += 100) {
  await client.inventory.batchCreateChanges({ idempotencyKey: crypto.randomUUID(), changes: tellingen.slice(i, i + 100) });
}
console.log(`Voorraad gezet: ${tellingen.length} variaties op ${AANTAL}.`);
