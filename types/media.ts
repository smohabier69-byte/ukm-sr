/** Bron van een media-item; bepaalt welke velden verplicht zijn en hoe de detailpagina rendert. */
export type MediaSoort = "video" | "artikel";

interface MediaBasis {
  slug: string;
  titel: string;
  samenvatting: string;
  /** Omslagbeeld voor de kaart en als posterbeeld bij een video. */
  omslag: string;
  gepubliceerdOp: string;
}

export interface VideoItem extends MediaBasis {
  soort: "video";
  videoBron: string;
  duurSeconden?: number;
}

export interface ArtikelItem extends MediaBasis {
  soort: "artikel";
  /** Alinea's platte tekst; wordt als losse <p> gerenderd op de detailpagina. */
  inhoud: string[];
  auteur?: string;
  leestijdMinuten?: number;
}

/**
 * Discriminated union op `soort`. Een nieuw artikeltype (bijvoorbeeld een
 * blogpost met koppen en afbeeldingen) breidt deze union uit zonder de
 * bestaande videokaarten of -pagina's te raken.
 */
export type MediaItem = VideoItem | ArtikelItem;
