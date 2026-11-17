import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

/**
 * Toegang voor de WhatsApp-bot (TCT) tot de bestellingen. De bot stuurt de
 * gedeelde sleutel mee als "Authorization: Bearer <sleutel>"; dezelfde
 * waarde staat op de server als BESTELLING_BOT_SLEUTEL.
 *
 * Geeft een foutantwoord terug als de toegang niet klopt, anders null.
 */
export function controleerBotToegang(request: Request): NextResponse | null {
  const verwacht = process.env.BESTELLING_BOT_SLEUTEL;
  if (!verwacht) {
    return NextResponse.json({ fout: "De bestellingen-bot is niet ingesteld." }, { status: 503 });
  }

  const kop = request.headers.get("authorization") ?? "";
  const gegeven = kop.startsWith("Bearer ") ? kop.slice(7).trim() : "";
  // Vergelijk hashes van gelijke lengte in constante tijd, zodat de sleutel niet te raden is via de responstijd.
  const a = createHash("sha256").update(gegeven).digest();
  const b = createHash("sha256").update(verwacht).digest();
  if (!gegeven || !timingSafeEqual(a, b)) {
    return NextResponse.json({ fout: "Geen toegang." }, { status: 401 });
  }
  return null;
}
