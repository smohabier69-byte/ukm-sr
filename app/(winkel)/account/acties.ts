"use server";

import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { eq, and, isNull, gt } from "drizzle-orm";

import { auth, signIn, signOut } from "@/auth";
import { db } from "@/lib/db/client";
import { users, passwordResetTokens, addresses } from "@/lib/db/schema";
import { resendClient } from "@/lib/email/client";
import { siteUrl, bedrijf } from "@/lib/site";
import {
  registratieSchema,
  inlogSchema,
  wachtwoordHerstelAanvraagSchema,
  wachtwoordHerstelSchema,
  adresSchema,
} from "@/lib/validatie/account";

export interface ActieResultaat {
  succes: boolean;
  fout?: string;
}

export async function registreer(_vorig: ActieResultaat, formData: FormData): Promise<ActieResultaat> {
  const ingevoerd = registratieSchema.safeParse({
    naam: formData.get("naam"),
    email: formData.get("email"),
    wachtwoord: formData.get("wachtwoord"),
  });
  if (!ingevoerd.success) {
    return { succes: false, fout: ingevoerd.error.issues[0]?.message ?? "Controleer de gegevens." };
  }
  const { naam, email, wachtwoord } = ingevoerd.data;

  const [bestaand] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (bestaand) {
    return { succes: false, fout: "Er bestaat al een account met dit e-mailadres." };
  }

  const passwordHash = await bcrypt.hash(wachtwoord, 10);
  await db.insert(users).values({ name: naam, email, passwordHash });

  const ingelogd = await signIn("credentials", { email, wachtwoord, redirect: false }).catch(() => null);
  if (!ingelogd) {
    return { succes: false, fout: "Account is aangemaakt, maar inloggen is niet gelukt. Probeer in te loggen." };
  }

  return { succes: true };
}

export async function logIn(_vorig: ActieResultaat, formData: FormData): Promise<ActieResultaat> {
  const ingevoerd = inlogSchema.safeParse({
    email: formData.get("email"),
    wachtwoord: formData.get("wachtwoord"),
  });
  if (!ingevoerd.success) {
    return { succes: false, fout: ingevoerd.error.issues[0]?.message ?? "Controleer de gegevens." };
  }

  const resultaat = await signIn("credentials", { ...ingevoerd.data, redirect: false }).catch(() => null);
  if (!resultaat) {
    return { succes: false, fout: "E-mailadres of wachtwoord klopt niet." };
  }
  return { succes: true };
}

export async function vraagWachtwoordHerstelAan(
  _vorig: ActieResultaat,
  formData: FormData,
): Promise<ActieResultaat> {
  const ingevoerd = wachtwoordHerstelAanvraagSchema.safeParse({ email: formData.get("email") });
  if (!ingevoerd.success) {
    return { succes: false, fout: ingevoerd.error.issues[0]?.message ?? "Vul een geldig e-mailadres in." };
  }
  const { email } = ingevoerd.data;

  // Altijd hetzelfde antwoord, ongeacht of het adres bestaat - anders is dit
  // formulier te gebruiken om te toetsen welke e-mailadressen een account hebben.
  const [gebruiker] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);

  if (gebruiker) {
    const ruweToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(ruweToken).digest("hex");
    const verlooptOm = new Date(Date.now() + 60 * 60 * 1000);

    await db.insert(passwordResetTokens).values({ userId: gebruiker.id, tokenHash, expiresAt: verlooptOm });

    const herstelLink = `${siteUrl}/account/wachtwoord-herstellen?token=${ruweToken}`;

    try {
      const resend = resendClient();
      await resend.emails.send({
        from: `${bedrijf.naam} <noreply@${new URL(siteUrl).hostname}>`,
        to: email,
        subject: "Wachtwoord herstellen",
        html: `<p>Klik op de onderstaande link om een nieuw wachtwoord in te stellen. Deze link is een uur geldig.</p><p><a href="${herstelLink}">${herstelLink}</a></p>`,
      });
    } catch {
      // RESEND_API_KEY is nog niet ingevuld (lokale ontwikkeling) - de link
      // loggen is dan het enige alternatief om de flow te kunnen testen.
      console.log(`[wachtwoord-herstel] RESEND_API_KEY ontbreekt. Link voor ${email}: ${herstelLink}`);
    }
  }

  return { succes: true };
}

export async function herstelWachtwoord(_vorig: ActieResultaat, formData: FormData): Promise<ActieResultaat> {
  const ingevoerd = wachtwoordHerstelSchema.safeParse({
    token: formData.get("token"),
    wachtwoord: formData.get("wachtwoord"),
  });
  if (!ingevoerd.success) {
    return { succes: false, fout: ingevoerd.error.issues[0]?.message ?? "Controleer de gegevens." };
  }
  const { token, wachtwoord } = ingevoerd.data;
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const [rij] = await db
    .select()
    .from(passwordResetTokens)
    .where(
      and(
        eq(passwordResetTokens.tokenHash, tokenHash),
        isNull(passwordResetTokens.usedAt),
        gt(passwordResetTokens.expiresAt, new Date()),
      ),
    )
    .limit(1);

  if (!rij) {
    return { succes: false, fout: "Deze link is ongeldig of verlopen. Vraag een nieuwe aan." };
  }

  const passwordHash = await bcrypt.hash(wachtwoord, 10);
  await db.update(users).set({ passwordHash, updatedAt: new Date() }).where(eq(users.id, rij.userId));
  await db.update(passwordResetTokens).set({ usedAt: new Date() }).where(eq(passwordResetTokens.id, rij.id));

  return { succes: true };
}

export async function meldAf(): Promise<void> {
  await signOut({ redirectTo: "/" });
}

async function huidigeGebruikerId(): Promise<string | null> {
  const sessie = await auth();
  return sessie?.user?.id ?? null;
}

export async function voegAdresToe(_vorig: ActieResultaat, formData: FormData): Promise<ActieResultaat> {
  const userId = await huidigeGebruikerId();
  if (!userId) return { succes: false, fout: "Log opnieuw in om een adres op te slaan." };

  const ingevoerd = adresSchema.safeParse({
    label: formData.get("label"),
    naam: formData.get("naam"),
    straat: formData.get("straat"),
    wijk: formData.get("wijk"),
    plaats: formData.get("plaats"),
    telefoon: formData.get("telefoon"),
    isStandaard: formData.get("isStandaard") === "on",
  });
  if (!ingevoerd.success) {
    return { succes: false, fout: ingevoerd.error.issues[0]?.message ?? "Controleer de gegevens." };
  }

  if (ingevoerd.data.isStandaard) {
    await db.update(addresses).set({ isStandaard: false }).where(eq(addresses.userId, userId));
  }

  await db.insert(addresses).values({ ...ingevoerd.data, wijk: ingevoerd.data.wijk || null, userId });
  return { succes: true };
}

export async function verwijderAdres(adresId: string): Promise<ActieResultaat> {
  const userId = await huidigeGebruikerId();
  if (!userId) return { succes: false, fout: "Log opnieuw in." };

  await db.delete(addresses).where(and(eq(addresses.id, adresId), eq(addresses.userId, userId)));
  return { succes: true };
}
