import "server-only";
import type { Categorie } from "@/types/product";
import { hoofdcategorieen } from "@/data/categorieen";
import { catalogus } from "./catalog.server";

export { hoofdcategorieen };

export async function alleCategorieen(): Promise<Categorie[]> {
  return (await catalogus()).categorieen;
}

export async function categorieOpSlug(slug: string): Promise<Categorie | undefined> {
  return (await alleCategorieen()).find((c) => c.slug === slug);
}

export async function alleCategorieSlugs(): Promise<string[]> {
  return [...hoofdcategorieen.map((c) => c.slug), ...(await alleCategorieen()).map((c) => c.slug)];
}

export interface Categoriecontext {
  slug: string;
  naam: string;
  omschrijving: string;
  afbeelding: string;
  soort: "bril" | "lens";
  isHoofdcategorie: boolean;
}

export async function categoriecontext(slug: string): Promise<Categoriecontext | undefined> {
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

  const categorie = await categorieOpSlug(slug);
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
