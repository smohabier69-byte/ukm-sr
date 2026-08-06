"use server";

import { z } from "zod";

import { db } from "@/lib/db/client";
import { newsletterSubscribers } from "@/lib/db/schema";

export interface ActieResultaat {
  succes: boolean;
  fout?: string;
}

const emailSchema = z.string().trim().toLowerCase().email("Vul een geldig e-mailadres in.");

export async function meldAanVoorNieuwsbrief(_vorig: ActieResultaat, formData: FormData): Promise<ActieResultaat> {
  const ingevoerd = emailSchema.safeParse(formData.get("email"));
  if (!ingevoerd.success) {
    return { succes: false, fout: ingevoerd.error.issues[0]?.message ?? "Controleer het e-mailadres." };
  }

  await db.insert(newsletterSubscribers).values({ email: ingevoerd.data }).onConflictDoNothing();

  return { succes: true };
}
