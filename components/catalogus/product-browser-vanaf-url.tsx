"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";

import { ProductBrowser } from "./product-browser";
import { bouwFacetten, uitZoekparameters } from "@/lib/catalogus";
import type { Product } from "@/types/product";

/**
 * Leest de beginfilterstaat uit de URL op de client in plaats van in de
 * paginacomponent (Server Component) zelf, achter een Suspense-grens (zie de
 * page.tsx-bestanden die dit gebruiken).
 *
 * Eerdere versie las window.location.search rechtstreeks: dat werkt niet
 * tijdens SSR (geen window), dus de server rendert met een lege beginstaat
 * terwijl de client bij een gedeelde, gefilterde link meteen de echte
 * waarden leest - een hydration mismatch (React-fout #418). useSearchParams
 * kent de binnenkomende request-parameters ook al op de server, dus server-
 * en clientrender komen overeen. De Suspense-grens is nodig omdat Next deze
 * hook als dynamic API markeert; zonder categorie/[slug]/loading.tsx (de
 * eigenlijke oorzaak van de eerdere dubbele render, zie git-historie) botst
 * dat niet meer met een automatische route-brede Suspense-grens.
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
