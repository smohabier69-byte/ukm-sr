import "server-only";
import type { Merk } from "@/types/product";
import { catalogus } from "./catalog.server";

export async function alleMerken(): Promise<Merk[]> {
  return (await catalogus()).merken;
}

export async function merkOpSlug(slug: string): Promise<Merk | undefined> {
  return (await alleMerken()).find((m) => m.slug === slug);
}
