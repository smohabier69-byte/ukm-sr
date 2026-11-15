import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Gift } from "lucide-react";

import { OnthulGroep, OnthulKind } from "@/components/motion/onthul";
import { Sectiekop } from "@/components/home/sectiekop";
import { alleProducten } from "@/lib/square/producten";
import { formatPrijs } from "@/lib/format";
import type { Product } from "@/types/product";
import { fotoStijl } from "@/lib/fotofocus";

interface Ontvanger {
  titel: string;
  tekst: string;
  href: string;
  /** Welke producten bij deze ontvanger horen; bepaalt aantal, vanafprijs en foto. */
  hoort: (product: Product) => boolean;
  kleur: string;
  /** Voorkeursfoto; ontbreekt het product, dan de eerste foto uit de selectie. */
  fotoVan?: string;
}

const ontvangers: Ontvanger[] = [
  {
    titel: "Voor haar",
    tekst: "Cat eyes, glitter en pastel, met glas dat meekleurt in de zon.",
    href: "/categorie/ptc",
    hoort: (p) => p.categorie === "ptc" || p.categorie === "anti-blauwlicht",
    kleur: "bg-blush-100",
    fotoVan: "glitter-round-ptc",
  },
  {
    titel: "Voor hem",
    tekst: "Randloos zeshoekig of sportief. Strak, licht en klaar voor buiten.",
    href: "/categorie/heren-unisex",
    hoort: (p) => p.categorie === "heren-unisex",
    kleur: "bg-salie-100",
    fotoVan: "sport-ptc",
  },
  {
    titel: "Voor de lezer",
    tekst: "Leesbrillen met blauwlichtfilter, van +1.5 tot +3.0.",
    href: "/categorie/leesbrillen",
    hoort: (p) => p.categorie === "leesbrillen",
    kleur: "bg-boter-100",
    fotoVan: "leesbril-glitter-pink-frameless",
  },
  {
    titel: "Voor wie durft",
    tekst: "Kleurlenzen in ruim dertig tinten, met en zonder sterkte.",
    href: "/categorie/lenzen",
    hoort: (p) => p.soort === "lens",
    kleur: "bg-lila-100",
    fotoVan: "aqua-blue",
  },
];

/** Prijsgrenzen voor "cadeaus tot ..."; een grens zonder producten valt weg. */
const budgetten = [
  { label: "Tot SRD 500", href: "/producten?tot=500&sorteer=prijs-op", past: (p: Product) => p.prijs <= 500 },
  {
    label: "SRD 500 tot 700",
    href: "/producten?vanaf=500&tot=700&sorteer=prijs-op",
    past: (p: Product) => p.prijs >= 500 && p.prijs <= 700,
  },
  { label: "Vanaf SRD 700", href: "/producten?vanaf=700&sorteer=prijs-op", past: (p: Product) => p.prijs >= 700 },
];

/**
 * Cadeauwijzer: zoeken op voor wie het is of op budget, in plaats van op
 * brillentechniek. Alle aantallen en vanafprijzen komen uit het echte
 * assortiment; een ingang zonder producten wordt niet getoond.
 */
export async function Cadeauwijzer() {
  const producten = (await alleProducten()).filter((p) => p.voorraad > 0);

  const kaarten = ontvangers
    .map((ontvanger) => {
      const selectie = producten.filter(ontvanger.hoort);
      const voorkeur = selectie.find((p) => p.slug === ontvanger.fotoVan) ?? selectie[0];
      return {
        ...ontvanger,
        aantal: selectie.length,
        vanaf: selectie.length ? Math.min(...selectie.map((p) => p.prijs)) : 0,
        // De tweede foto is waar mogelijk de modelfoto; die vertelt meer dan het montuur alleen.
        foto: voorkeur?.afbeeldingen[1] ?? voorkeur?.afbeeldingen[0],
      };
    })
    .filter((kaart) => kaart.aantal > 0 && kaart.foto);

  const budgetknoppen = budgetten
    .map((budget) => ({ ...budget, aantal: producten.filter(budget.past).length }))
    .filter((budget) => budget.aantal > 0);

  if (kaarten.length === 0) return null;

  return (
    <section id="cadeauwijzer" className="scroll-mt-28 bg-white py-16 schulp-boven schulp-onder lg:py-24">
      <div className="container-ukm">
        <Sectiekop
          gecentreerd
          bovenschrift="Cadeauwijzer"
          titel={
            <>
              Voor wie zoek je <em>iets moois?</em>
            </>
          }
          tekst="Een bril of een set lenzen is een cadeau dat elke dag gedragen wordt. Kies voor wie het is, of begin bij je budget."
        />

        <OnthulGroep className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {kaarten.map((kaart) => (
            <OnthulKind key={kaart.titel} className="h-full">
              <Link
                href={kaart.href}
                className={`group relative flex h-full flex-col overflow-hidden rounded-[2rem] ${kaart.kleur} p-6 pb-0 transition-shadow duration-500 hover:shadow-kaart`}
              >
                <span className="flex items-start justify-between gap-3">
                  <span>
                    <span className="block font-display text-2xl font-semibold text-inkt">{kaart.titel}</span>
                    <span className="mt-1 block text-xs font-medium text-inkt-zacht">
                      {kaart.aantal} cadeaus · vanaf {formatPrijs(kaart.vanaf)}
                    </span>
                  </span>
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-inkt transition-transform duration-300 ease-[var(--ease-uit)] group-hover:rotate-45">
                    <ArrowUpRight className="size-4" />
                  </span>
                </span>
                <span className="mt-3 mb-6 block text-sm leading-relaxed text-inkt-zacht">{kaart.tekst}</span>

                {/* mt-auto: de boog staat altijd onderaan de kaart, ook als de tekst erboven langer is. */}
                <span className="relative mx-auto mt-auto block aspect-square w-[82%] max-w-72 shrink-0 translate-y-px overflow-hidden rounded-t-full bg-white/60">
                  <Image
                    src={kaart.foto!}
                    alt=""
                    fill
                    sizes="(min-width: 1280px) 20vw, (min-width: 640px) 40vw, 80vw"
                    style={fotoStijl(kaart.foto!)}
                    className="object-cover transition-transform duration-700 ease-[var(--ease-uit)] group-hover:scale-105"
                  />
                </span>
              </Link>
            </OnthulKind>
          ))}
        </OnthulGroep>

        {budgetknoppen.length > 0 ? (
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <p className="flex items-center gap-2 text-sm font-medium text-inkt">
              <Gift className="size-4 text-blush-500" />
              Of kies op budget
            </p>
            <ul className="flex flex-wrap justify-center gap-2.5">
              {budgetknoppen.map((budget) => (
                <li key={budget.label}>
                  <Link
                    href={budget.href}
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-creme px-4 py-2 text-sm transition-colors hover:border-salie-400 hover:bg-salie-50"
                  >
                    {budget.label}
                    <span className="rounded-full bg-white px-2 py-0.5 text-[0.6875rem] text-inkt-zacht">
                      {budget.aantal}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}
