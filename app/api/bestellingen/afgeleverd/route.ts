import { NextResponse } from "next/server";
import { and, inArray, isNull, sql } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/lib/db/client";
import { bestellingen } from "@/lib/db/schema";
import { controleerBotToegang } from "@/lib/winkel/bot-toegang.server";

export const dynamic = "force-dynamic";

const bodySchema = z.object({ bestelnummers: z.array(z.string().min(1).max(40)).min(1).max(50) });

/** De WhatsApp-bot meldt hier welke bestellingen hij heeft doorgestuurd. */
export async function POST(request: Request) {
  const geweigerd = controleerBotToegang(request);
  if (geweigerd) return geweigerd;

  const ingevoerd = bodySchema.safeParse(await request.json().catch(() => null));
  if (!ingevoerd.success) {
    return NextResponse.json({ fout: "Ongeldige aanvraag." }, { status: 400 });
  }

  const bijgewerkt = await db
    .update(bestellingen)
    .set({ afgeleverdOp: new Date() })
    .where(and(inArray(bestellingen.bestelnummer, ingevoerd.data.bestelnummers), isNull(bestellingen.afgeleverdOp), sql`(${bestellingen.gegevens}->'bevestiging' IS NULL OR ${bestellingen.gegevens}->'bevestiging'->>'status' = 'bevestigd')`))
    .returning({ bestelnummer: bestellingen.bestelnummer });

  return NextResponse.json({ afgeleverd: bijgewerkt.map((b) => b.bestelnummer) });
}
