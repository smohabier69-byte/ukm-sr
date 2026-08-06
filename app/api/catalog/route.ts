import { NextResponse } from "next/server";

import { catalogus } from "@/lib/square/catalog.server";

/**
 * Publieke, gecachede catalogus-JSON voor clientcomponenten die niet
 * rechtstreeks een Server Component kunnen `await`-en (winkelwagen,
 * afrekenen, de zoeksuggesties in de header). Leest dezelfde
 * `unstable_cache`-laag als de Server Components, dus geen extra
 * Square-verzoek per bezoeker.
 */
export async function GET() {
  const data = await catalogus();
  return NextResponse.json(data, { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=3600" } });
}
