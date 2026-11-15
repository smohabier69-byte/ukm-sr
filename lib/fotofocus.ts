import focus from "@/data/catalogus/fotofocus.json";

const brandpunten = focus as Record<string, string>;

/**
 * CSS object-position voor een productfoto, zodat het gezicht of montuur in
 * beeld blijft als de foto in een kaart, boog of banner wordt uitgesneden.
 * Berekend door scripts/bereken-fotofocus.mjs. Foto's die daar niet in staan
 * (bijvoorbeeld uit Square) vallen terug op iets boven het midden, waar bij
 * portretten het gezicht zit.
 */
export function fotoPositie(src: string | undefined): string {
  return (src && brandpunten[src]) || "50% 35%";
}

/** Kant-en-klare style-prop voor next/image. */
export function fotoStijl(src: string | undefined): { objectPosition: string } {
  return { objectPosition: fotoPositie(src) };
}
