import { NextResponse } from "next/server";
import { z } from "zod";

import { BestellingFout, plaatsBestelling } from "@/lib/winkel/bestelling.server";

const bodySchema = z.object({
  regels: z
    .array(
      z.object({
        slug: z.string().min(1),
        variantId: z.string().optional(),
        aantal: z.number().int().min(1).max(10),
      }),
    )
    .min(1),
  contact: z.object({
    voornaam: z.string().min(1),
    achternaam: z.string().min(1),
    telefoon: z.string().min(1),
    email: z.string().email(),
  }),
  bezorgwijze: z.enum(["bezorgen", "afhalen"]),
  adres: z
    .object({
      straat: z.string().min(1),
      wijk: z.string().optional(),
      plaats: z.string().min(1),
      opmerking: z.string().optional(),
    })
    .optional(),
  // Online betalen via Square staat uit tot de nieuwe Square-account gekoppeld is.
  betaalwijze: z.enum(["contant", "overschrijving", "pin"]),
  kortingscode: z.string().optional().nullable(),
});

/**
 * Plaatst een bestelling. Die gaat als WhatsApp-bericht naar UKM (zie
 * lib/winkel/bestelling.server.ts); deze route levert het bestelnummer, het
 * nagerekende overzicht en de WhatsApp-link.
 */
export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const ingevoerd = bodySchema.safeParse(json);
  if (!ingevoerd.success) {
    return NextResponse.json({ fout: "Ongeldige aanvraag." }, { status: 400 });
  }

  const data = ingevoerd.data;
  if (data.bezorgwijze === "bezorgen" && !data.adres) {
    return NextResponse.json({ fout: "Bezorgadres ontbreekt." }, { status: 400 });
  }

  try {
    return NextResponse.json(await plaatsBestelling(data));
  } catch (err) {
    if (err instanceof BestellingFout) {
      return NextResponse.json({ fout: err.message }, { status: 400 });
    }
    console.error("Bestelling plaatsen mislukt:", err);
    return NextResponse.json({ fout: "De bestelling kon niet worden geplaatst. Probeer het opnieuw." }, { status: 500 });
  }
}
