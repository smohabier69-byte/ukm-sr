"use server";

import { eq, and } from "drizzle-orm";

import { auth } from "@/auth";
import { db } from "@/lib/db/client";
import { wishlistItems } from "@/lib/db/schema";

/**
 * squareCatalogObjectId houdt vandaag een productslug (zie schema.ts) omdat
 * de Square-koppeling er nog niet is - hernoemen zodra Fase 3 de echte
 * catalogus-objectID's oplevert.
 */

async function huidigeGebruikerId(): Promise<string | null> {
  const sessie = await auth();
  return sessie?.user?.id ?? null;
}

export async function haalVerlanglijstOp(): Promise<string[]> {
  const userId = await huidigeGebruikerId();
  if (!userId) return [];

  const rijen = await db
    .select({ slug: wishlistItems.squareCatalogObjectId })
    .from(wishlistItems)
    .where(eq(wishlistItems.userId, userId));
  return rijen.map((r) => r.slug);
}

export async function wisselVerlanglijst(slug: string): Promise<{ actief: boolean }> {
  const userId = await huidigeGebruikerId();
  if (!userId) return { actief: false };

  const [bestaand] = await db
    .select({ id: wishlistItems.id })
    .from(wishlistItems)
    .where(and(eq(wishlistItems.userId, userId), eq(wishlistItems.squareCatalogObjectId, slug)))
    .limit(1);

  if (bestaand) {
    await db.delete(wishlistItems).where(eq(wishlistItems.id, bestaand.id));
    return { actief: false };
  }

  await db.insert(wishlistItems).values({ userId, squareCatalogObjectId: slug });
  return { actief: true };
}

export async function leegmaakVerlanglijst(): Promise<void> {
  const userId = await huidigeGebruikerId();
  if (!userId) return;
  await db.delete(wishlistItems).where(eq(wishlistItems.userId, userId));
}

/** Eenmalig aangeroepen net na inloggen: de anonieme localStorage-lijst overnemen. */
export async function mergeGastVerlanglijst(slugs: string[]): Promise<void> {
  const userId = await huidigeGebruikerId();
  if (!userId || slugs.length === 0) return;

  await db
    .insert(wishlistItems)
    .values(slugs.map((slug) => ({ userId, squareCatalogObjectId: slug })))
    .onConflictDoNothing();
}
