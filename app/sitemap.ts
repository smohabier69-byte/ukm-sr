import type { MetadataRoute } from "next";

import { alleProducten } from "@/lib/square/producten";
import { alleMerken } from "@/lib/square/merken";
import { alleCategorieSlugs } from "@/lib/square/categorieen";
import { mediaItems } from "@/data/media";
import { siteUrl } from "@/lib/site";

/**
 * Sitemap met alles wat een zoekmachine mag indexeren.
 *
 * De winkelwagen, het afrekenen, de verlanglijst en het account staan er
 * bewust niet in: die pagina's zijn persoonlijk en hebben in de
 * zoekresultaten niets te zoeken.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const nu = new Date();
  const [productenLijst, merkenLijst, categorieSlugs] = await Promise.all([
    alleProducten(),
    alleMerken(),
    alleCategorieSlugs(),
  ]);

  const vast: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, lastModified: nu, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/producten`, lastModified: nu, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteUrl}/aanbiedingen`, lastModified: nu, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/merken`, lastModified: nu, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/media`, lastModified: nu, changeFrequency: "weekly", priority: 0.6 },
    { url: `${siteUrl}/over-ons`, lastModified: nu, changeFrequency: "yearly", priority: 0.6 },
    { url: `${siteUrl}/contact`, lastModified: nu, changeFrequency: "yearly", priority: 0.7 },
    { url: `${siteUrl}/veelgestelde-vragen`, lastModified: nu, changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteUrl}/privacybeleid`, lastModified: nu, changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteUrl}/algemene-voorwaarden`, lastModified: nu, changeFrequency: "yearly", priority: 0.3 },
  ];

  const categorieen: MetadataRoute.Sitemap = categorieSlugs.map((slug) => ({
    url: `${siteUrl}/categorie/${slug}`,
    lastModified: nu,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const merkpaginas: MetadataRoute.Sitemap = merkenLijst.map((merk) => ({
    url: `${siteUrl}/merken/${merk.slug}`,
    lastModified: nu,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const productpaginas: MetadataRoute.Sitemap = productenLijst.map((product) => ({
    url: `${siteUrl}/producten/${product.slug}`,
    lastModified: new Date(product.toegevoegdOp),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const mediapaginas: MetadataRoute.Sitemap = mediaItems.map((item) => ({
    url: `${siteUrl}/media/${item.slug}`,
    lastModified: new Date(item.gepubliceerdOp),
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [...vast, ...categorieen, ...merkpaginas, ...productpaginas, ...mediapaginas];
}
