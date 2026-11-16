import type { Categorie } from "@/types/product";

const foto = (lijst: string, bestand: string) => `/producten/nov26/${lijst}/${lijst}-${bestand}.webp`;

export const categorieen: Categorie[] = [
  {
    slug: "ptc",
    naam: "PTC photochrome brillen",
    omschrijving:
      "Helder binnen, donker in de zon. Photochromic Technology Coating beschermt tegen UV en blauw licht in een montuur.",
    soort: "bril",
    afbeelding: foto("dames", "p025-1"),
  },
  {
    slug: "anti-blauwlicht",
    naam: "Anti-blauwlicht brillen",
    omschrijving: "Heldere glazen die het blauwe licht van schermen filteren. Voor lange dagen achter laptop en telefoon.",
    soort: "bril",
    afbeelding: foto("dames", "p033-2"),
  },
  {
    slug: "leesbrillen",
    naam: "Leesbrillen",
    omschrijving: "Leesbrillen met blauwlichtfilter in +1.5, +2.0, +2.5 en +3.0. Van randloos tot cat eye.",
    soort: "bril",
    afbeelding: foto("lees", "p003-1"),
  },
  {
    slug: "heren-unisex",
    naam: "Heren en unisex",
    omschrijving: "PTC-monturen voor hem en voor iedereen, van randloos zeshoekig tot sportief, plus de Night Vision-rijbril.",
    soort: "bril",
    afbeelding: foto("heren", "p002-2"),
  },
  {
    slug: "lenzen-zonder-sterkte",
    naam: "Kleurlenzen zonder sterkte",
    omschrijving: "Zachte kleurlenzen in dertig tinten, van natuurlijk bruin tot uitgesproken blauw.",
    soort: "lens",
    afbeelding: foto("lenzen", "p005-2"),
  },
  {
    slug: "lenzen-met-sterkte",
    naam: "Kleurlenzen met sterkte",
    omschrijving: "Corrigeren en verkleuren tegelijk, met sterktes van -1.00 tot -8.00.",
    soort: "lens",
    afbeelding: foto("lenzen", "p049-1"),
  },
];

/** De twee hoofdingangen in de navigatie. */
export const hoofdcategorieen = [
  {
    slug: "brillen",
    naam: "Brillen",
    omschrijving: "Photochrome PTC-monturen, anti-blauwlicht brillen en leesbrillen.",
    soort: "bril" as const,
    afbeelding: foto("dames", "p010-2"),
    subcategorieen: ["ptc", "anti-blauwlicht", "leesbrillen", "heren-unisex"],
  },
  {
    slug: "lenzen",
    naam: "Lenzen",
    omschrijving: "Zachte kleurlenzen, met en zonder sterkte.",
    soort: "lens" as const,
    afbeelding: foto("lenzen", "p012-1"),
    subcategorieen: ["lenzen-zonder-sterkte", "lenzen-met-sterkte"],
  },
];

export function categorieOpSlug(slug: string): Categorie | undefined {
  return categorieen.find((c) => c.slug === slug);
}

/** Elke geldige categorie-URL, inclusief de twee overkoepelende ingangen. */
export const alleCategorieSlugs = [
  ...hoofdcategorieen.map((c) => c.slug),
  ...categorieen.map((c) => c.slug),
];

export interface Categoriecontext {
  slug: string;
  naam: string;
  omschrijving: string;
  afbeelding: string;
  soort: "bril" | "lens";
  /** Overkoepelend, zoals "Brillen", of een losse collectie. */
  isHoofdcategorie: boolean;
}

/** Zoekt de gegevens bij een categorie-URL op, ongeacht welk van de twee soorten het is. */
export function categoriecontext(slug: string): Categoriecontext | undefined {
  const hoofd = hoofdcategorieen.find((c) => c.slug === slug);
  if (hoofd) {
    return {
      slug: hoofd.slug,
      naam: hoofd.naam,
      omschrijving: hoofd.omschrijving,
      afbeelding: hoofd.afbeelding,
      soort: hoofd.soort,
      isHoofdcategorie: true,
    };
  }

  const categorie = categorieOpSlug(slug);
  if (!categorie) return undefined;

  return {
    slug: categorie.slug,
    naam: categorie.naam,
    omschrijving: categorie.omschrijving,
    afbeelding: categorie.afbeelding,
    soort: categorie.soort,
    isHoofdcategorie: false,
  };
}
