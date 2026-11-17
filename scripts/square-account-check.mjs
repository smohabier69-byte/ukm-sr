/**
 * Alleen-lezen controle van de Square-account in .env.local: van wie is hij,
 * welke valuta en locaties heeft hij, hoeveel producten en webhooks staan er.
 * Draai dit na het invullen van een nieuw SQUARE_ACCESS_TOKEN, voordat er
 * iets naar de account geschreven wordt.
 *
 *   node scripts/square-account-check.mjs
 *
 * Toont geen tokens of sleutels.
 */
import process from "node:process";
import { SquareClient, SquareEnvironment } from "square";

process.loadEnvFile(".env.local");

const token = process.env.SQUARE_ACCESS_TOKEN;
if (!token) {
  console.error("SQUARE_ACCESS_TOKEN ontbreekt in .env.local.");
  process.exit(1);
}
const productie = process.env.SQUARE_ENVIRONMENT === "production";
const client = new SquareClient({ token, environment: productie ? SquareEnvironment.Production : SquareEnvironment.Sandbox });

console.log(`Omgeving: ${productie ? "production" : "sandbox"}`);

const merchant = (await client.merchants.get({ merchantId: "me" })).merchant;
console.log(`Account: ${merchant?.businessName ?? "?"} (${merchant?.id}) - land ${merchant?.country}, valuta ${merchant?.currency}`);

const locaties = (await client.locations.list()).locations ?? [];
console.log(`\nLocaties (${locaties.length}):`);
for (const l of locaties) {
  const huidig = l.id === process.env.SQUARE_LOCATION_ID ? "  <- SQUARE_LOCATION_ID" : "";
  console.log(`  ${l.id}  ${l.name}  [${l.status}, ${l.currency}]${huidig}`);
}
if (!locaties.some((l) => l.id === process.env.SQUARE_LOCATION_ID)) {
  console.log("  Let op: SQUARE_LOCATION_ID hoort niet bij deze account.");
}

let items = 0;
let getrackt = 0;
let afbeeldingen = 0;
for await (const obj of await client.catalog.list({ types: "ITEM,IMAGE" })) {
  if (obj.type === "IMAGE") afbeeldingen++;
  if (obj.type !== "ITEM") continue;
  items++;
  if ((obj.itemData?.variations ?? []).some((v) => v.itemVariationData?.trackInventory)) getrackt++;
}
console.log(`\nCatalogus: ${items} producten (${getrackt} met voorraadtelling), ${afbeeldingen} foto's`);

const abos = [];
for await (const s of await client.webhooks.subscriptions.list({ includeDisabled: true })) abos.push(s);
console.log(`\nWebhooks (${abos.length}):`);
for (const s of abos) console.log(`  ${s.name}  ${s.enabled ? "aan" : "uit"}  ${s.notificationUrl}  [${(s.eventTypes ?? []).join(", ")}]`);
