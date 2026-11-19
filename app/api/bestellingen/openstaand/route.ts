import { NextResponse } from "next/server";
import { and, asc, isNull, sql } from "drizzle-orm";

import { db } from "@/lib/db/client";
import { bestellingen } from "@/lib/db/schema";
import { controleerBotToegang } from "@/lib/winkel/bot-toegang.server";

export const dynamic = "force-dynamic";

/**
 * Nog niet afgeleverde bestellingen, oudste eerst, voor de WhatsApp-bot.
 * De bot stuurt ze door en meldt ze daarna via /api/bestellingen/afgeleverd.
 */
export async function GET(request: Request) {
  const geweigerd = controleerBotToegang(request);
  if (geweigerd) return geweigerd;

  const open = await db
    .select({ bestelnummer: bestellingen.bestelnummer, bericht: bestellingen.bericht })
    .from(bestellingen)
    .where(and(isNull(bestellingen.afgeleverdOp), sql`${bestellingen.gegevens}->'bevestiging' IS NULL`))
    .orderBy(asc(bestellingen.aangemaaktOp))
    .limit(10);

  return NextResponse.json({ bestellingen: open });
}
