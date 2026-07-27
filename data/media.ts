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
];

export function mediaOpSlug(slug: string): MediaItem | undefined {
  return mediaItems.find((item) => item.slug === slug);
}

export function gesorteerdeMedia(): MediaItem[] {
  return [...mediaItems].sort((a, b) => b.gepubliceerdOp.localeCompare(a.gepubliceerdOp));
}
