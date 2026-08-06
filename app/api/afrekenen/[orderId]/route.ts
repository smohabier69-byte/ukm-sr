import { NextResponse } from "next/server";

import { haalBestellingOp } from "@/lib/square/bestellen.server";

/**
 * De bevestigingspagina haalt de bestelling hierover opnieuw op bij Square in
 * plaats van een "succes"-parameter uit de redirect te vertrouwen.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const bestelling = await haalBestellingOp(orderId);
  if (!bestelling) {
    return NextResponse.json({ fout: "Bestelling niet gevonden." }, { status: 404 });
  }
  return NextResponse.json(bestelling);
}
