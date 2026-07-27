import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Persoonlijke en afgeschermde delen horen niet in de zoekresultaten.
      disallow: ["/beheer", "/beheer/", "/winkelwagen", "/afrekenen", "/verlanglijst", "/account", "/zoeken"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
