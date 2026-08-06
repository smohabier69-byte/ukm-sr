import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { Paginakop } from "@/components/catalogus/paginakop";
import { ProductBrowser } from "@/components/catalogus/product-browser";
import { Badge } from "@/components/ui/badge";
import { alleProducten } from "@/lib/square/producten";
import { bouwFacetten, uitZoekparameters } from "@/lib/catalogus";

export const metadata: Metadata = {
  title: "Zoeken",
  description: "Zoek in het volledige assortiment brillen en lenzen van UKM.sr.",
  robots: { index: false, follow: true },
};

/** Ingangen die vaak worden gezocht; helpt wanneer het zoekveld nog leeg is. */
const populaireZoektermen = [
  "cat eye",
  "browline",
  "frameless",
  "luipaard",
  "kinderbril",
  "grijze lenzen",
  "blauwe lenzen",
  "met sterkte",
];

export default async function Zoekpagina({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const producten = await alleProducten();
  const facetten = bouwFacetten(producten);
  const beginstaat = uitZoekparameters(params, facetten);

  return (
    <>
      <Paginakop
        kruimels={[{ label: "Home", href: "/" }, { label: "Zoeken" }]}
        titel={beginstaat.zoekterm ? `Zoekresultaten voor "${beginstaat.zoekterm}"` : "Zoeken"}
        tekst="Zoek op modelnaam, kleur of vorm. Nederlandse termen werken ook: typ gerust zwarte bril of grijze lenzen."
      />

      <section className="container-ukm py-10 lg:py-14">
        <div className="mb-10 flex flex-wrap items-center gap-2">
          <span className="text-sm text-inkt-zacht">Veelgezocht:</span>
          {populaireZoektermen.map((term) => (
            <Link key={term} href={`/zoeken?q=${encodeURIComponent(term)}`}>
              <Badge
                variant="outline"
                className="transition-colors hover:border-salie-400 hover:bg-salie-50"
              >
                {term}
              </Badge>
            </Link>
          ))}
        </div>

        {/* De browser leest de zoekterm uit de URL, dus hij hangt aan een Suspense-grens. */}
        <Suspense fallback={null}>
          <ProductBrowser
            key={beginstaat.zoekterm}
            producten={producten}
            beginstaat={beginstaat}
            metZoekveld
          />
        </Suspense>
      </section>
    </>
  );
}
