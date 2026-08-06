/**
 * Registreert (of werkt bij) het Square-webhookabonnement voor deze site, zodat
 * catalogus- en voorraadwijzigingen in Square direct doorkomen op de website
 * i.p.v. pas na de 1u-cachevangnet in lib/square/catalog.server.ts.
 * Idempotent op naam: bestaat er al een abonnement met dezelfde NAAM, dan
 * wordt die bijgewerkt in plaats van gedupliceerd.
 *
 * Schrijft de teruggegeven signature key naar .env.local
 * (SQUARE_WEBHOOK_SIGNATURE_KEY) voor lokaal gebruik. Zet 'm ook in Vercel:
 *
 *   npx vercel env add SQUARE_WEBHOOK_SIGNATURE_KEY production
 *
 * Let op: het abonnement is gekoppeld aan de omgeving van SQUARE_ACCESS_TOKEN
 * (nu sandbox). Zodra UKM's echte Square-productietoken is ingevuld, moet dit
 * script opnieuw draaien tegen dat token om het productie-abonnement aan te
 * maken.
 *
 *   npx tsx scripts/square-webhook-setup.ts
 */
import crypto from "node:crypto";
import fs from "node:fs";
import { SquareClient, SquareEnvironment } from "square";

process.loadEnvFile(".env.local");

const token = process.env.SQUARE_ACCESS_TOKEN;
if (!token) {
  console.error("SQUARE_ACCESS_TOKEN ontbreekt in .env.local.");
  process.exit(1);
}

// Altijd de publieke productie-URL, nooit process.env.NEXT_PUBLIC_SITE_URL:
// die staat lokaal op http://localhost:3000, en Square accepteert alleen een
// publiek bereikbare https-URL als notification_url.
const PRODUCTIE_URL = "https://ukm-sr.vercel.app";
const notificationUrl = `${PRODUCTIE_URL}/api/webhooks/square`;
const NAAM = "UKM.sr storefront";
const EVENT_TYPES = ["payment.updated", "catalog.version.updated", "inventory.count.updated"];

const client = new SquareClient({
  token,
  environment: process.env.SQUARE_ENVIRONMENT === "production" ? SquareEnvironment.Production : SquareEnvironment.Sandbox,
});

function schrijfSleutel(sleutel: string | undefined) {
  if (!sleutel) {
    console.error("Geen signature key teruggekregen van Square.");
    return;
  }
  const pad = ".env.local";
  const inhoud = fs.readFileSync(pad, "utf8");
  const regel = `SQUARE_WEBHOOK_SIGNATURE_KEY=${sleutel}`;
  const bijgewerkt = /^SQUARE_WEBHOOK_SIGNATURE_KEY=.*$/m.test(inhoud)
    ? inhoud.replace(/^SQUARE_WEBHOOK_SIGNATURE_KEY=.*$/m, regel)
    : `${inhoud.trimEnd()}\n${regel}\n`;
  fs.writeFileSync(pad, bijgewerkt);
  console.log("SQUARE_WEBHOOK_SIGNATURE_KEY bijgewerkt in .env.local.");
}

async function main() {
  const bestaande = await client.webhooks.subscriptions.list({ includeDisabled: true });
  let subscriptionId: string | undefined;
  for await (const abo of bestaande) {
    if (abo.name === NAAM) {
      subscriptionId = abo.id;
      break;
    }
  }

  if (subscriptionId) {
    await client.webhooks.subscriptions.update({
      subscriptionId,
      subscription: { name: NAAM, eventTypes: EVENT_TYPES, notificationUrl, enabled: true },
    });
    console.log(`Bijgewerkt: bestaand abonnement ${subscriptionId} -> ${notificationUrl}`);

    const sleutelRes = await client.webhooks.subscriptions.updateSignatureKey({
      subscriptionId,
      idempotencyKey: crypto.randomUUID(),
    });
    schrijfSleutel(sleutelRes.signatureKey);
    return;
  }

  const res = await client.webhooks.subscriptions.create({
    idempotencyKey: crypto.randomUUID(),
    subscription: { name: NAAM, eventTypes: EVENT_TYPES, notificationUrl },
  });
  console.log(`Aangemaakt: abonnement ${res.subscription?.id} -> ${notificationUrl}`);
  schrijfSleutel(res.subscription?.signatureKey);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
