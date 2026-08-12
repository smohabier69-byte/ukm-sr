"use client";

import * as React from "react";

import { ProductBrowser } from "./product-browser";
import { bouwFacetten, uitZoekparameters } from "@/lib/catalogus";
import type { Product } from "@/types/product";

/**
 * Leest de beginfilterstaat uit de URL op de client in plaats van in de
 * paginacomponent (Server Component) zelf.
 *
 * Categorie- en merkpagina's combineren generateStaticParams +
 * dynamicParams:false (voor een echte 404 op onbekende slugs) met een
 * dynamische parameter zoals searchParams. next/navigation's useSearchParams
 * bleek zelf het probleem: Next markeert die hook als een "dynamic API" en
 * stuurt op basis daarvan een gestreamde "resume"-render bovenop de statische
 * shell - op de categoriepagina (met een loading.tsx, dus een automatische
 * route-brede Suspense-grens) verving die hersteldeel de oorspronkelijke
 * inhoud nooit, zichtbaar als een verweesde <div id="S:n"> met een complete
 * duplicaat-kopie in de client-DOM. window.location.search omzeilt Next's
 * dynamic-API-detectie volledig: gewone browser-JS, geen next/navigation-hook.
 */
export function ProductBrowserVanafUrl({
  producten,
  metZoekveld,
}: {
  producten: Product[];
  metZoekveld?: boolean;
}) {
  const facetten = React.useMemo(() => bouwFacetten(producten), [producten]);

  const beginstaat = React.useMemo(() => {
    const zoekparams = new URLSearchParams(typeof window === "undefined" ? "" : window.location.search);
    const record: Record<string, string | string[] | undefined> = {};
    for (const sleutel of zoekparams.keys()) {
      if (record[sleutel] !== undefined) continue;
      const waarden = zoekparams.getAll(sleutel);
      record[sleutel] = waarden.length > 1 ? waarden : waarden[0];
    }
    return uitZoekparameters(record, facetten);
  }, [facetten]);

  return <ProductBrowser producten={producten} beginstaat={beginstaat} metZoekveld={metZoekveld} />;
}
