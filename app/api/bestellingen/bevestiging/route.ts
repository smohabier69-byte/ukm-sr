import { NextResponse } from "next/server";
import { and, asc, eq, gt, isNull, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db/client";
import { bestellingen } from "@/lib/db/schema";
import { controleerBotToegang } from "@/lib/winkel/bot-toegang.server";

export const dynamic = "force-dynamic";
const states = ["wacht_op_bot", "wacht_op_klant", "bevestigd", "controle", "geannuleerd"] as const;
const bodySchema = z.object({
  bestelnummer: z.string().regex(/^UKM-\d{6}-\d{4}$/),
  telefoon: z.string().regex(/^[1-9]\d{7,14}$/),
  status: z.enum(states),
});
function digits(value: string) {
  let n = value.replace(/\D/g, "").replace(/^00/, "");
  if (n.length === 7) n = "597" + n;
  return n;
}

/** Cursor avoids a silent customer's order blocking later orders. */
export async function GET(request: Request) {
  const denied = controleerBotToegang(request);
  if (denied) return denied;
  const cursor = new URL(request.url).searchParams.get("na") ?? "";
  if (cursor && !/^UKM-\d{6}-\d{4}$/.test(cursor)) return NextResponse.json({ fout: "Ongeldige cursor" }, { status: 400 });
  const rows = await db.select({ bestelnummer: bestellingen.bestelnummer, bericht: bestellingen.bericht, gegevens: bestellingen.gegevens })
    .from(bestellingen)
    .where(and(isNull(bestellingen.afgeleverdOp), sql`${bestellingen.gegevens}->'bevestiging'->>'versie' = '1'`, cursor ? gt(bestellingen.bestelnummer, cursor) : undefined))
    .orderBy(asc(bestellingen.bestelnummer)).limit(1);
  return NextResponse.json({ bestellingen: rows, volgende: rows.at(-1)?.bestelnummer ?? "" });
}

/** Idempotent, monotonic transitions; an unconfirmed order cannot be acknowledged. */
export async function POST(request: Request) {
  const denied = controleerBotToegang(request);
  if (denied) return denied;
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ fout: "Ongeldige aanvraag" }, { status: 400 });
  const { bestelnummer, telefoon, status } = parsed.data;
  const [row] = await db.select({ gegevens: bestellingen.gegevens }).from(bestellingen).where(eq(bestellingen.bestelnummer, bestelnummer)).limit(1);
  const data = row?.gegevens as { contact?: { telefoon?: string }; bevestiging?: { status?: string } } | undefined;
  if (!data?.contact?.telefoon || digits(data.contact.telefoon) !== telefoon || !data.bevestiging?.status) {
    return NextResponse.json({ fout: "Bestelling niet gevonden" }, { status: 404 });
  }
  const previous = data.bevestiging.status;
  const allowed: Record<string, string[]> = {
    wacht_op_bot: ["wacht_op_klant", "controle", "geannuleerd"],
    wacht_op_klant: ["bevestigd", "controle", "geannuleerd"],
    bevestigd: [], controle: [], geannuleerd: [],
  };
  if (previous === status) return NextResponse.json({ status });
  if (!allowed[previous]?.includes(status)) return NextResponse.json({ fout: "Deze overgang is niet toegestaan" }, { status: 409 });
  const updated = await db.update(bestellingen).set({
    gegevens: sql`jsonb_set(${bestellingen.gegevens}, '{bevestiging}', ${JSON.stringify({ versie: 1, status, bijgewerktOp: new Date().toISOString() })}::jsonb)`,
  }).where(and(eq(bestellingen.bestelnummer, bestelnummer), sql`${bestellingen.gegevens}->'bevestiging'->>'status' = ${previous}`))
    .returning({ bestelnummer: bestellingen.bestelnummer });
  return NextResponse.json(updated.length ? { status } : { fout: "Bestelling is gewijzigd; probeer opnieuw" }, { status: updated.length ? 200 : 409 });
}
