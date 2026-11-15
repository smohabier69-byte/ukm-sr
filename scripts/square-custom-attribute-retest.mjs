/**
 * Herhaling van de custom-attribute-repro (docs/square-mapping-notes.md, bevinding 8),
 * volgens de suggesties van Square-support (forumreactie van jseok, 2026-08-12):
 * unieke idempotency key per poging, nieuwste API-versie (SDK-default, niet
 * vastgepind op 2025-02-20), en tegen production i.p.v. sandbox.
 *
 * Ruimt zichzelf altijd op (definitie + item), ongeacht uitkomst.
 *
 *   node --env-file=.env.local scripts/square-custom-attribute-retest.mjs
 */
import crypto from "node:crypto";
import { SquareClient, SquareEnvironment } from "square";

const token = process.env.SQUARE_ACCESS_TOKEN;
if (!token) {
  console.error("SQUARE_ACCESS_TOKEN ontbreekt. Run met --env-file=.env.local.");
  process.exit(1);
}

const environment =
  process.env.SQUARE_ENVIRONMENT === "production" ? SquareEnvironment.Production : SquareEnvironment.Sandbox;
const client = new SquareClient({ token, environment });

const runId = crypto.randomUUID().slice(0, 8);
const attrKey = `retest_${runId}`;
let definitionId;
let itemId;

async function main() {
  console.log(`Omgeving: ${environment} — run ${runId}`);

  console.log("\n1. Custom attribute definition aanmaken (STRING, unieke key)...");
  const defRes = await client.catalog.object.upsert({
    idempotencyKey: crypto.randomUUID(),
    object: {
      type: "CUSTOM_ATTRIBUTE_DEFINITION",
      id: "#retest-def",
      customAttributeDefinitionData: {
        type: "STRING",
        name: attrKey,
        key: attrKey,
        allowedObjectTypes: ["ITEM"],
        sellerVisibility: "SELLER_VISIBILITY_READ_WRITE_VALUES",
        appVisibility: "APP_VISIBILITY_READ_WRITE_VALUES",
      },
    },
  });
  definitionId = defRes.catalogObject?.id;
  console.log(`   definitionId = ${definitionId}`);
  if (!definitionId) throw new Error("Geen definitionId terug — kan niet doorgaan.");

  console.log("\n2. Item aanmaken met custom_attribute_values gezet op de write zelf...");
  const itemRes = await client.catalog.object.upsert({
    idempotencyKey: crypto.randomUUID(),
    object: {
      type: "ITEM",
      id: "#retest-item",
      itemData: {
        name: `Retest item ${runId}`,
        customAttributeValues: {
          [attrKey]: {
            key: attrKey,
            customAttributeDefinitionId: definitionId,
            type: "STRING",
            stringValue: "hello-from-retest",
          },
        },
        variations: [
          {
            type: "ITEM_VARIATION",
            id: "#retest-var",
            itemVariationData: {
              name: "Default",
              pricingType: "FIXED_PRICING",
              priceMoney: { amount: 100n, currency: "SRD" },
            },
          },
        ],
      },
    },
  });
  itemId = itemRes.catalogObject?.id;
  const onWriteResponse = itemRes.catalogObject?.itemData?.customAttributeValues;
  console.log(`   itemId = ${itemId}`);
  console.log(`   customAttributeValues op de write-respons zelf:`, JSON.stringify(onWriteResponse ?? null));

  console.log("\n3. Los terugvragen via RetrieveCatalogObject...");
  const getRes = await client.catalog.object.get({ objectId: itemId });
  const onRead = getRes.object?.itemData?.customAttributeValues;
  console.log(`   customAttributeValues bij los uitlezen:`, JSON.stringify(onRead ?? null));

  const persisted = Boolean(onRead && onRead[attrKey]?.stringValue === "hello-from-retest");
  console.log(`\n=== RESULTAAT: custom attribute ${persisted ? "BLIJFT HANGEN ✅" : "gaat nog steeds verloren ❌"} ===`);

  return persisted;
}

async function cleanup() {
  console.log("\nOpruimen...");
  try {
    if (itemId) {
      await client.catalog.object.delete({ objectId: itemId });
      console.log(`   item ${itemId} verwijderd`);
    }
  } catch (err) {
    console.error(`   kon item niet verwijderen: ${err.message ?? err}`);
  }
  try {
    if (definitionId) {
      await client.catalog.object.delete({ objectId: definitionId });
      console.log(`   definitie ${definitionId} verwijderd`);
    }
  } catch (err) {
    console.error(`   kon definitie niet verwijderen: ${err.message ?? err}`);
  }
}

main()
  .then(async (persisted) => {
    await cleanup();
    process.exit(persisted ? 0 : 1);
  })
  .catch(async (err) => {
    console.error("\nFOUT tijdens repro:", err);
    await cleanup();
    process.exit(2);
  });
