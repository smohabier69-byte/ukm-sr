import type { MediaItem } from "@/types/media";

/**
 * Alle media-items van de winkel: video's nu, artikelen zodra die er zijn.
 * Nieuwe items komen hier gewoon bij; de listing- en detailpagina lezen
 * alles via `soort` uit, ongeacht het type.
 */
export const mediaItems: MediaItem[] = [
  {
    slug: "brillen-uitgeprobeerd",
    soort: "video",
    titel: "Brillen uitgeprobeerd bij UKM.sr",
    samenvatting:
      "Montuur-reveals met prijzen, de lenskleur-close-up en de kindercollectie - opgenomen in de winkel aan de Rembrandtstraat.",
    omslag: "/media/showcase/producten-showcase-poster.jpg",
    gepubliceerdOp: "2026-07-27",
    videoBron: "/media/showcase/producten-showcase.mp4",
  },
  {
    slug: "montuur-try-on",
    soort: "video",
    titel: "Montuur try-on: van rimless tot cat eye",
    samenvatting:
      "Een volledige pasronde langs meerdere modellen, met de prijs steeds in beeld: van een randloos montuur tot de roze glitter cat eye en het zwarte vierkant.",
    omslag: "/media/clips/montuur-try-on-poster.jpg",
    gepubliceerdOp: "2026-07-27",
    videoBron: "/media/clips/montuur-try-on.mp4",
  },
  {
    slug: "lenskleuren-in-beeld",
    soort: "video",
    titel: "Kleurlenzen in beeld",
    samenvatting:
      "Close-up van onze meest gedragen lenskleuren, van transparant bruin tot caramel coffee, met de naam van elke tint in beeld.",
    omslag: "/media/clips/lenskleuren-in-beeld-poster.jpg",
    gepubliceerdOp: "2026-07-27",
    videoBron: "/media/clips/lenskleuren-in-beeld.mp4",
  },
  {
    slug: "kinderbril-in-de-praktijk",
    soort: "video",
    titel: "Kinderbril in de praktijk",
    samenvatting:
      "Een kinderbril op kindermaat, buiten uitgeprobeerd in de zon - met onze openingstijden en het adres aan het eind.",
    omslag: "/media/clips/kinderbril-in-de-praktijk-poster.jpg",
    gepubliceerdOp: "2026-07-27",
    videoBron: "/media/clips/kinderbril-in-de-praktijk.mp4",
  },
];

export function mediaOpSlug(slug: string): MediaItem | undefined {
  return mediaItems.find((item) => item.slug === slug);
}

export function gesorteerdeMedia(): MediaItem[] {
  return [...mediaItems].sort((a, b) => b.gepubliceerdOp.localeCompare(a.gepubliceerdOp));
}
