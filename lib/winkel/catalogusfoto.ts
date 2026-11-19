import { brillenInvoer } from "@/data/catalogus/brillen";
import { lenzenInvoer } from "@/data/catalogus/lenzen";

/** Original catalog photos, never the AI-reconstructed studio photographs. */
export function catalogusfoto(slug: string, variantId?: string): string | undefined {
  const bril = brillenInvoer.find((p) => p.slug === slug);
  if (bril) {
    if (variantId) return bril.varianten?.find((v) => v.id === variantId)?.afbeelding;
    if (bril.varianten?.length) return undefined;
    return bril.afbeeldingen[0];
  }
  return lenzenInvoer.find((p) => p.slug === slug)?.afbeeldingen[0];
}
