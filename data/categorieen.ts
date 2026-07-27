import type { Categorie } from "@/types/product";

export const categorieen: Categorie[] = [
  {
    slug: "ptc",
    naam: "PTC photochrome brillen",
    omschrijving:
      "Helder binnen, donker in de zon. Photochromic Technology Coating beschermt tegen UV en blauw licht in een montuur.",
    soort: "bril",
    afbeelding: "/producten/brillen/brillen-p036-1.jpg",
  },
  {
    slug: "anti-blauwlicht",
    naam: "Anti-blauwlicht brillen",
    omschrijving:
      "Heldere glazen die het blauwe licht van schermen filteren. Minder vermoeide ogen, minder hoofdpijn, beter slapen.",
    soort: "bril",
    afbeelding: "/producten/brillen/brillen-p013-1.jpg",
  },
  {
    slug: "kinderbrillen",
    naam: "Kinderbrillen",
    omschrijving: "Lichte monturen op kindermaat, gemaakt voor huiswerk, tablet en televisie.",
    soort: "bril",
    afbeelding: "/producten/brillen/brillen-p004-1.jpg",
  },
  {
    slug: "lenzen-met-sterkte",
    naam: "Kleurlenzen met sterkte",
    omschrijving: "Corrigeren en verkleuren tegelijk, met sterktes van -1.00 tot -8.00.",
    soort: "lens",
    afbeelding: "/producten/lenzen/lenzen-p011-1.jpg",
  },
  {
    slug: "lenzen-zonder-sterkte",
    naam: "Kleurlenzen zonder sterkte",
    omschrijving: "Zachte kleurlenzen in ruim dertig tinten, van natuurlijk bruin tot uitgesproken blauw.",
    soort: "lens",
    afbeelding: "/producten/lenzen/lenzen-p047-1.jpg",
  },
];

/** De twee hoofdingangen in de navigatie. */
export const hoofdcategorieen = [
  {
    slug: "brillen",
    naam: "Brillen",
    omschrijving: "Anti-blauwlicht en photochrome monturen voor elke dag.",
    soort: "bril" as const,
    afbeelding: "/producten/brillen/brillen-p059-1.jpg",
    subcategorieen: ["ptc", "anti-blauwlicht", "kinderbrillen"],
  },
  {
    slug: "lenzen",
    naam: "Lenzen",
    omschrijving: "Zachte kleurlenzen, met en zonder sterkte.",
    soort: "lens" as const,
    afbeelding: "/producten/lenzen/lenzen-p020-1.jpg",
    subcategorieen: ["lenzen-met-sterkte", "lenzen-zonder-sterkte"],
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
