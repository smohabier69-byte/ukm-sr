"use server";

import { z } from "zod";

import { resendClient } from "@/lib/email/client";
import { bedrijf } from "@/lib/site";

export interface ActieResultaat {
  succes: boolean;
  fout?: string;
}

const contactSchema = z.object({
  naam: z.string().min(1, "Vul uw naam in."),
  telefoon: z.string().min(1, "Vul uw telefoonnummer in."),
  email: z.string().trim().toLowerCase().email("Vul een geldig e-mailadres in."),
  onderwerp: z.string().min(1),
  bericht: z.string().min(1, "Vul een bericht in."),
});

export async function verstuurContactformulier(_vorig: ActieResultaat, formData: FormData): Promise<ActieResultaat> {
  const ingevoerd = contactSchema.safeParse({
    naam: formData.get("naam"),
    telefoon: formData.get("telefoon"),
    email: formData.get("email"),
    onderwerp: formData.get("onderwerp"),
    bericht: formData.get("bericht"),
  });
  if (!ingevoerd.success) {
    return { succes: false, fout: ingevoerd.error.issues[0]?.message ?? "Controleer de gegevens." };
  }
  const { naam, telefoon, email, onderwerp, bericht } = ingevoerd.data;

  const html = `<p><strong>Naam:</strong> ${naam}</p><p><strong>Telefoon:</strong> ${telefoon}</p><p><strong>E-mail:</strong> ${email}</p><p><strong>Onderwerp:</strong> ${onderwerp}</p><p><strong>Bericht:</strong></p><p>${bericht.replace(/\n/g, "<br />")}</p>`;

  try {
    const resend = resendClient();
    await resend.emails.send({
      from: `${bedrijf.naam} website <noreply@${new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://ukm.sr").hostname}>`,
      to: bedrijf.email,
      replyTo: email,
      subject: `Contactformulier: ${onderwerp}`,
      html,
    });
  } catch {
    // RESEND_API_KEY nog niet ingevuld (lokale ontwikkeling) - loggen is dan
    // het enige alternatief om de flow te kunnen testen. Zelfde patroon als
    // wachtwoord-herstel in app/(winkel)/account/acties.ts.
    console.log(`[contactformulier] RESEND_API_KEY ontbreekt. Bericht van ${email}: ${bericht}`);
  }

  return { succes: true };
}
