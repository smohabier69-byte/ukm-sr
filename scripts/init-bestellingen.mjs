import { neon } from "@neondatabase/serverless";

// Add only the order-notification table defined in lib/db/schema.ts.
// Existing accounts, products, payments and stock are not modified.
if (process.env.BESTELLING_BOT_SLEUTEL) {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL ontbreekt voor websitebestellingen");
  const sql = neon(process.env.DATABASE_URL);
  await sql`CREATE TABLE IF NOT EXISTS "bestelling" (
    "bestelnummer" text PRIMARY KEY,
    "bericht" text NOT NULL,
    "gegevens" jsonb NOT NULL,
    "aangemaaktOp" timestamp DEFAULT now() NOT NULL,
    "afgeleverdOp" timestamp
  )`;
  console.log("Websitebestellingen: tabel gereed.");
}
