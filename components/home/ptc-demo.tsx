"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Home, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { fotoStijl } from "@/lib/fotofocus";

const standen = [
  {
    id: "binnen",
    label: "Binnen",
    icoon: Home,
    titel: "Helder binnenshuis",
    tekst: "Binnen blijft het glas helder. Het blauwlichtfilter doet gewoon zijn werk bij telefoon en laptop.",
    foto: "/producten/nov26/dames/dames-p070-1.webp",
    alt: "Model met een PTC-bril binnen: de glazen zijn helder",
  },
  {
    id: "buiten",
    label: "In de zon",
    icoon: Sun,
    titel: "Donker in de zon",
    tekst: "Buiten kleurt hetzelfde glas vanzelf donker en beschermt het tegen UV. Ga je weer naar binnen, dan wordt het weer helder.",
    foto: "/producten/nov26/dames/dames-p070-2.webp",
    alt: "Hetzelfde model buiten: de glazen zijn donker gekleurd",
  },
] as const;

/**
 * Laat het photochrome effect zien met de twee foto's uit de prijslijst:
 * dezelfde bril binnen en buiten. Geen filter of animatie over een foto, maar
 * twee echte opnames die in elkaar overvloeien.
 */
export function PtcDemo() {
  const [actief, setActief] = React.useState<number>(0);
  const stand = standen[actief];

  return (
    <section className="container-ukm py-16 lg:py-24">
      <div className="overflow-hidden rounded-[2rem] bg-salie-800 text-creme shadow-kaart">
        <div className="grid lg:grid-cols-2">
          <div className="relative aspect-[4/5] sm:aspect-[4/3] lg:aspect-auto lg:min-h-[34rem]">
            {standen.map((s, i) => (
              <motion.div
                key={s.id}
                className="absolute inset-0"
                initial={false}
                animate={{ opacity: actief === i ? 1 : 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                aria-hidden={actief !== i}
              >
                <Image
                  src={s.foto}
                  alt={s.alt}
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  style={fotoStijl(s.foto)}
                  className="object-cover"
                />
              </motion.div>
            ))}

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
                      "relative flex items-center gap-1.5 rounded-full px-5 py-2.5 text-xs font-medium transition-colors",
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
                    <s.icoon className="relative size-3.5" />
                    <span className="relative">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-16">
            <p className="text-salie-300 bovenschrift">Wat betekent PTC?</p>
            <h2 className="mt-4 font-display text-3xl font-semibold sm:text-[2.625rem] sm:leading-[1.08]">
              Een bril voor <em className="!text-salie-300">binnen en buiten</em>
            </h2>
            <p className="mt-5 max-w-md leading-relaxed text-creme/75">
              PTC staat voor Photochromic Technology Coating. Bescherming tegen UV en tegen blauw licht, in een enkele
              bril.
            </p>

            <motion.div
              key={stand.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mt-8 rounded-2xl bg-white/8 p-5"
            >
              <p className="flex items-center gap-2 font-display text-lg font-semibold">
                <stand.icoon className="size-5 text-goud-licht" />
                {stand.titel}
              </p>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-creme/75">{stand.tekst}</p>
            </motion.div>

            <div className="mt-9">
              <Button asChild variant="wit">
                <Link href="/producten?techniek=ptc">
                  Bekijk alle PTC-brillen
                  <ArrowRight />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
