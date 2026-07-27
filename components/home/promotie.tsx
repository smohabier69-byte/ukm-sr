import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Tag } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Onthul } from "@/components/motion/onthul";
import { formatPrijs } from "@/lib/format";
import { bedrijf } from "@/lib/site";
import { aanbiedingen } from "@/data/producten";

/**
 * Lopende acties. De eerste kaart haalt de scherpste aanbieding uit het
 * assortiment op, zodat de prijs nooit uit de pas loopt met de catalogus.
 */
export function Promotie() {
  const actie = aanbiedingen[0];

  return (
    <section className="container-ukm py-14 lg:py-20">
      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <Onthul className="group relative overflow-hidden rounded-3xl bg-inkt text-creme">
          <Image
            src="/producten/brillen/brillen-p053-2.jpg"
            alt=""
            fill
            sizes="(min-width: 1024px) 62vw, 100vw"
            className="object-cover object-top opacity-45 transition-transform duration-[1200ms] ease-[var(--ease-uit)] group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-inkt via-inkt/85 to-inkt/25" />

          <div className="relative max-w-lg p-8 sm:p-12 lg:p-14">
            <Badge variant="korting" className="mb-5">
              <Tag />
              Actie van de maand
            </Badge>
            <h2 className="font-display text-3xl font-bold sm:text-[2.5rem] sm:leading-[1.1]">
              Translucent Square nu {actie ? formatPrijs(actie.prijs) : "in de aanbieding"}
            </h2>
            <p className="mt-4 max-w-md leading-relaxed text-creme/75">
              Doorschijnend gekleurd acetaat met photochrome glazen. Zolang de voorraad strekt, in paars, blauw en
              roze.
            </p>
            <Button asChild variant="wit" size="lg" className="mt-8">
              <Link href="/aanbiedingen">
                Naar de aanbiedingen
                <ArrowRight />
              </Link>
            </Button>
          </div>
        </Onthul>

        <Onthul vertraging={0.1} className="flex flex-col justify-between rounded-3xl bg-salie-100 p-8 sm:p-10">
          <div>
            <p className="font-display text-[0.6875rem] font-semibold tracking-[0.14em] text-salie-700 uppercase">
              Bezorging
            </p>
            <h3 className="mt-3 font-display text-2xl font-bold sm:text-3xl">
              Gratis bezorgd vanaf {formatPrijs(bedrijf.gratisBezorgingVanaf)}
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-salie-800/80">
              Daaronder bezorgen we door heel {bedrijf.adres.stad} vanaf {formatPrijs(bedrijf.bezorgingVanaf)}. Liever
              zelf passen? Haal uw bestelling op aan de {bedrijf.adres.straat}.
            </p>
          </div>

          <Button asChild variant="outline" className="mt-8 self-start">
            <Link href="/veelgestelde-vragen#bezorging">Bezorgvoorwaarden</Link>
          </Button>
        </Onthul>
      </div>
    </section>
  );
}
