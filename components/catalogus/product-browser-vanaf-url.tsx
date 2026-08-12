"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";

import { ProductBrowser } from "./product-browser";
import { bouwFacetten, uitZoekparameters } from "@/lib/catalogus";
import type { Product } from "@/types/product";

/**
 * Leest de beginfilterstaat uit de URL op de client in plaats van in de
 * paginacomponent (Server Component) zelf.
 *
 * Categorie- en merkpagina's combineren generateStaticParams +
 * dynamicParams:false (voor een echte 404 op onbekende slugs) met een
 * dynamische parameter zoals searchParams. Die combinatie dwong Next tot een
 * gestreamde "resume"-render bovenop de statische shell, en de herstelkopie
 * (een verweesde <div id="S:n">-hersteldeel) verving de oorspronkelijke
 * inhoud nooit - vandaar de dubbele kop, kruimelpad en JSON-LD in de
 * uiteindelijke DOM. Door useSearchParams hier te lezen, achter een
 * Suspense-grens, blijft de paginacomponent zelf volledig statisch.
 */
export function ProductBrowserVanafUrl({
  producten,
  metZoekveld,
}: {
  producten: Product[];
  metZoekveld?: boolean;
}) {
  const zoekparams = useSearchParams();
  const facetten = React.useMemo(() => bouwFacetten(producten), [producten]);

  const beginstaat = React.useMemo(() => {
    const record: Record<string, string | string[] | undefined> = {};
    for (const sleutel of zoekparams.keys()) {
      if (record[sleutel] !== undefined) continue;
      const waarden = zoekparams.getAll(sleutel);
      record[sleutel] = waarden.length > 1 ? waarden : waarden[0];
    }
    return uitZoekparameters(record, facetten);
  }, [zoekparams, facetten]);

  return <ProductBrowser producten={producten} beginstaat={beginstaat} metZoekveld={metZoekveld} />;
}
