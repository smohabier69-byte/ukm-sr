import "server-only";
import { Resend } from "resend";

let instantie: Resend | null = null;

/**
 * Pas een fout bij het eerste echte gebruik (wachtwoord-herstel, e-mail bij
 * bestelling), niet bij het opstarten - zodat de rest van de site blijft
 * werken zolang RESEND_API_KEY nog niet is ingevuld.
 */
export function resendClient(): Resend {
  if (instantie) return instantie;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY ontbreekt. Vul .env.local in voor lokaal gebruik.");
  }

  instantie = new Resend(apiKey);
  return instantie;
}
