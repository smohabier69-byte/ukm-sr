import type { MetadataRoute } from "next";

import { producten } from "@/data/producten";
import { alleCategorieSlugs } from "@/data/categorieen";
import { merken } from "@/data/merken";
import { siteUrl } from "@/lib/site";

/**
 * Sitemap met alles wat een zoekmachine mag indexeren.
 *
 * De winkelwagen, het afrekenen, de verlanglijst, het account en het
 * beheerpaneel staan er bewust niet in: die pagina's zijn persoonlijk of
 * afgeschermd en hebben in de zoekresultaten niets te zoeken.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const nu = new Date();

  const vast: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, lastModified: nu, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/producten`, lastModified: nu, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteUrl}/aanbiedingen`, lastModified: nu, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/merken`, lastModified: nu, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/over-ons`, lastModified: nu, changeFrequency: "yearly", priority: 0.6 },
    { url: `${siteUrl}/contact`, lastModified: nu, changeFrequency: "yearly", priority: 0.7 },
    { url: `${siteUrl}/veelgestelde-vragen`, lastModified: nu, changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteUrl}/privacybeleid`, lastModified: nu, changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteUrl}/algemene-voorwaarden`, lastModified: nu, changeFrequency: "yearly", priority: 0.3 },
  ];

  const categorieen: MetadataRoute.Sitemap = alleCategorieSlugs.map((slug) => ({
    url: `${siteUrl}/categorie/${slug}`,
    lastModified: nu,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const merkpaginas: MetadataRoute.Sitemap = merken.map((merk) => ({
    url: `${siteUrl}/merken/${merk.slug}`,
    lastModified: nu,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const productpaginas: MetadataRoute.Sitemap = producten.map((product) => ({
    url: `${siteUrl}/producten/${product.slug}`,
    lastModified: new Date(product.toegevoegdOp),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...vast, ...categorieen, ...merkpaginas, ...productpaginas];
}
