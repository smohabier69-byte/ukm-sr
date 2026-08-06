import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { maakBestelling, BestellingFout } from "@/lib/square/bestellen.server";

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
  betaalwijze: z.enum(["contant", "overschrijving", "pin", "online"]),
  kortingscode: z.string().optional().nullable(),
});

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

  const sessie = await auth();

  try {
    const resultaat = await maakBestelling({
      userId: sessie?.user?.id,
      regels: data.regels,
      contact: data.contact,
      bezorgwijze: data.bezorgwijze,
      adres: data.adres,
      betaalwijze: data.betaalwijze,
      kortingscode: data.kortingscode,
    });
    return NextResponse.json(resultaat);
  } catch (err) {
    if (err instanceof BestellingFout) {
      return NextResponse.json({ fout: err.message }, { status: 400 });
    }
    console.error("Bestelling aanmaken mislukt:", err);
    return NextResponse.json({ fout: "De bestelling kon niet worden aangemaakt. Probeer het opnieuw." }, { status: 500 });
  }
}
