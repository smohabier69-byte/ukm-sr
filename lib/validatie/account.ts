import { z } from "zod";

const wachtwoordVeld = z
  .string()
  .min(8, "Minimaal 8 tekens.")
  .max(72, "Maximaal 72 tekens."); // bcrypt negeert alles voorbij 72 bytes

export const registratieSchema = z.object({
  naam: z.string().trim().min(1, "Vul een naam in.").max(120),
  email: z.string().trim().toLowerCase().email("Vul een geldig e-mailadres in."),
  wachtwoord: wachtwoordVeld,
});

export const inlogSchema = z.object({
  email: z.string().trim().toLowerCase().email("Vul een geldig e-mailadres in."),
  wachtwoord: z.string().min(1, "Vul je wachtwoord in."),
});

export const wachtwoordHerstelAanvraagSchema = z.object({
  email: z.string().trim().toLowerCase().email("Vul een geldig e-mailadres in."),
});

export const wachtwoordHerstelSchema = z.object({
  token: z.string().min(1),
  wachtwoord: wachtwoordVeld,
});

export const adresSchema = z.object({
  label: z.string().trim().min(1, "Geef het adres een naam, bijvoorbeeld Thuis.").max(60),
  naam: z.string().trim().min(1, "Vul een naam in.").max(120),
  straat: z.string().trim().min(1, "Vul een straat en huisnummer in.").max(200),
  wijk: z.string().trim().max(120).optional().or(z.literal("")),
  plaats: z.string().trim().min(1, "Vul een plaats in.").max(120),
  telefoon: z.string().trim().max(30).optional().or(z.literal("")),
  isStandaard: z.boolean().optional(),
});
