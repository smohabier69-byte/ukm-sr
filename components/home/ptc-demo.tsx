"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Cloud, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const standen = [
  {
    id: "binnen",
    label: "Binnen",
    icoon: Cloud,
    titel: "Volledig helder",
    tekst: "Binnenshuis blijft het glas transparant. Het blauwlichtfilter werkt gewoon door bij schermwerk.",
    filter: "none",
  },
  {
    id: "bewolkt",
    label: "Bewolkt",
    icoon: Cloud,
    titel: "Licht geschaduwd",
    tekst: "Bij diffuus daglicht kleurt het glas licht mee, net genoeg om fel wit te dempen.",
    filter: "brightness(0.82) sepia(0.22) saturate(0.85) contrast(1.06)",
  },
  {
    id: "zon",
    label: "Volle zon",
    icoon: Sun,
    titel: "Diep donker",
    tekst: "In direct zonlicht kleurt het glas binnen enkele seconden donker en blokkeert het UV tot 400 nm.",
    filter: "brightness(0.6) sepia(0.4) saturate(0.7) contrast(1.14)",
  },
] as const;

/**
 * Toont het photochrome effect als een schuifbare demonstratie. De verdonkering
 * is een CSS-filter over dezelfde foto en dus een illustratie van het effect,
 * geen opname van het glas zelf; dat staat er ook expliciet bij.
 */
export function PtcDemo() {
  const [actief, setActief] = React.useState<number>(0);
  const stand = standen[actief];

  return (
    <section className="container-ukm py-16 lg:py-24">
      <div className="overflow-hidden rounded-3xl border border-border/70 bg-white shadow-kaart">
        <div className="grid lg:grid-cols-2">
          <div className="relative aspect-[4/3] lg:aspect-auto lg:min-h-[32rem]">
            <motion.div
              className="absolute inset-0"
              animate={{ filter: stand.filter }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            >
              <Image
                src="/producten/brillen/brillen-p036-1.jpg"
                alt="Model draagt de PTC Diamond Rose Gold Frameless"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover object-top"
              />
            </motion.div>

            <div className="absolute inset-x-0 bottom-0 flex justify-center p-5">
              <div
                role="tablist"
                aria-label="Lichtomstandigheden"
                className="flex gap-1 rounded-full border border-white/25 bg-inkt/55 p-1 backdrop-blur-md"
              >
                {standen.map((s, i) => (
                  <button
                    key={s.id}
                    role="tab"
                    type="button"
                    aria-selected={actief === i}
                    onClick={() => setActief(i)}
                    className={cn(
                      "relative rounded-full px-4 py-2 text-xs font-medium transition-colors",
                      actief === i ? "text-inkt" : "text-white/80 hover:text-white",
                    )}
                  >
                    {actief === i ? (
                      <motion.span
                        layoutId="ptc-stand"
                        className="absolute inset-0 rounded-full bg-creme"
                        transition={{ type: "spring", stiffness: 320, damping: 32 }}
                      />
                    ) : null}
                    <span className="relative">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-14">
            <p className="font-display text-[0.6875rem] font-semibold tracking-[0.14em] text-salie-600 uppercase">
              Photochromic Technology Coating
            </p>
            <h2 className="mt-4 font-display text-3xl font-bold sm:text-4xl">Een bril voor binnen en buiten</h2>

            <motion.div key={stand.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <p className="mt-6 flex items-center gap-2 font-display text-lg font-semibold text-salie-700">
                <stand.icoon className="size-5" />
                {stand.titel}
              </p>
              <p className="mt-2 max-w-md leading-relaxed text-inkt-zacht">{stand.tekst}</p>
            </motion.div>

            <ul className="mt-8 grid gap-3 text-sm sm:grid-cols-2">
              {[
                "Blokkeert UV-straling tot 400 nm",
                "Filtert blauw licht van schermen",
                "Terug naar helder binnenshuis",
                "Geen tweede zonnebril nodig",
              ].map((punt) => (
                <li key={punt} className="flex items-start gap-2">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-salie-400" />
                  <span className="text-inkt-zacht">{punt}</span>
                </li>
              ))}
            </ul>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Button asChild>
                <Link href="/categorie/ptc">
                  Bekijk de PTC-collectie
                  <ArrowRight />
                </Link>
              </Button>
              <p className="text-xs text-inkt-zacht">Illustratie van het effect</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
