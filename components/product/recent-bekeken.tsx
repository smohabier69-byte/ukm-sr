"use client";

import * as React from "react";

import { Productkaart } from "@/components/product/productkaart";
import { useRecentBekeken, useWinkelHydratie } from "@/lib/winkel/stores";
import type { Product } from "@/types/product";

/** Legt vast dat dit product bekeken is; rendert zelf niets. */
export function RegistreerBezoek({ slug }: { slug: string }) {
  const gehydrateerd = useWinkelHydratie();
  const registreer = useRecentBekeken((staat) => staat.registreer);

  React.useEffect(() => {
    if (gehydrateerd) registreer(slug);
  }, [gehydrateerd, registreer, slug]);

  return null;
}

/**
 * Rail met eerder bekeken artikelen.
 *
 * Welke producten dat zijn staat alleen in de browser, dus de catalogus wordt
 * pas na hydratie ingeladen met een dynamische import. Zou hij als prop
 * meekomen, dan stond de hele productlijst in de payload van elke pagina waar
 * deze rail staat.
 */
export function RecentBekeken({ huidigeSlug, titel = "Recent bekeken" }: { huidigeSlug?: string; titel?: string }) {
  const gehydrateerd = useWinkelHydratie();
  const slugs = useRecentBekeken((staat) => staat.slugs);
  const [catalogus, setCatalogus] = React.useState<Product[]>([]);

  const teTonen = slugs.filter((slug) => slug !== huidigeSlug);

  React.useEffect(() => {
    if (!gehydrateerd || teTonen.length === 0 || catalogus.length > 0) return;
    let geannuleerd = false;
    import("@/data/producten").then((module) => {
      if (!geannuleerd) setCatalogus(module.producten);
    });
    return () => {
      geannuleerd = true;
    };
  }, [gehydrateerd, teTonen.length, catalogus.length]);

  if (!gehydrateerd || catalogus.length === 0) return null;

  const producten = teTonen
    .map((slug) => catalogus.find((p) => p.slug === slug))
    .filter((p): p is Product => Boolean(p))
    .slice(0, 4);

  if (producten.length === 0) return null;

  return (
    <section className="container-ukm py-14 lg:py-20">
      <h2 className="mb-10 font-display text-2xl font-bold sm:text-3xl">{titel}</h2>
      <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
        {producten.map((product) => (
          <Productkaart key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
