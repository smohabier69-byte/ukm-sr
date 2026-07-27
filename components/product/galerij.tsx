"use client";

import * as React from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * Productgalerij met vergroting.
 *
 * Bij aanwijzen met de muis schaalt de foto op rond de cursor. Op aanraakschermen
 * is dat er niet - daar zou het alleen in de weg zitten - en blader je met de
 * pijlen of door de miniaturen aan te tikken.
 */
export function Galerij({
  afbeeldingen,
  naam,
  labels = [],
}: {
  afbeeldingen: string[];
  naam: string;
  labels?: React.ReactNode;
}) {
  const [actief, setActief] = React.useState(0);
  const [zoomt, setZoomt] = React.useState(false);
  const [oorsprong, setOorsprong] = React.useState("50% 50%");

  const volg = (e: React.MouseEvent<HTMLDivElement>) => {
    const vlak = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - vlak.left) / vlak.width) * 100;
    const y = ((e.clientY - vlak.top) / vlak.height) * 100;
    setOorsprong(`${x}% ${y}%`);
  };

  const ga = (stap: number) =>
    setActief((huidig) => (huidig + stap + afbeeldingen.length) % afbeeldingen.length);

  return (
    <div className="flex flex-col-reverse gap-4 lg:flex-row">
      {afbeeldingen.length > 1 ? (
        <div
          className="flex gap-3 overflow-x-auto lg:w-20 lg:shrink-0 lg:flex-col lg:overflow-visible"
          role="tablist"
          aria-label="Productfoto's"
        >
          {afbeeldingen.map((afbeelding, i) => (
            <button
              key={afbeelding}
              type="button"
              role="tab"
              aria-selected={actief === i}
              aria-label={`Foto ${i + 1} van ${afbeeldingen.length}`}
              onClick={() => setActief(i)}
              className={cn(
                "relative aspect-square w-16 shrink-0 overflow-hidden rounded-xl bg-creme-diep transition-all duration-300 lg:w-full",
                actief === i
                  ? "ring-2 ring-salie-600 ring-offset-2 ring-offset-background"
                  : "opacity-65 hover:opacity-100",
              )}
            >
              <Image src={afbeelding} alt="" fill sizes="80px" className="object-cover object-top" />
            </button>
          ))}
        </div>
      ) : null}

      <div className="relative min-w-0 flex-1">
        <div
          onMouseEnter={() => setZoomt(true)}
          onMouseLeave={() => setZoomt(false)}
          onMouseMove={volg}
          className="group relative aspect-[3/4] cursor-zoom-in overflow-hidden rounded-3xl bg-creme-diep"
        >
          <AnimatePresence initial={false} mode="wait">
            <motion.div
              key={afbeeldingen[actief]}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0"
            >
              <Image
                src={afbeeldingen[actief]}
                alt={`${naam} - foto ${actief + 1}`}
                fill
                priority
                sizes="(min-width: 1024px) 45vw, 100vw"
                style={{ transformOrigin: oorsprong }}
                className={cn(
                  "object-cover object-top transition-transform duration-300 ease-out",
                  zoomt ? "scale-[2]" : "scale-100",
                )}
              />
            </motion.div>
          </AnimatePresence>

          <div className="pointer-events-none absolute top-4 left-4 flex flex-col items-start gap-1.5">{labels}</div>

          <div className="pointer-events-none absolute right-4 bottom-4 flex items-center gap-1.5 rounded-full bg-inkt/55 px-3 py-1.5 text-xs text-white opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100 max-lg:hidden">
            <ZoomIn className="size-3.5" />
            Beweeg om te vergroten
          </div>

          {afbeeldingen.length > 1 ? (
            <>
              <button
                type="button"
                onClick={() => ga(-1)}
                aria-label="Vorige foto"
                className="absolute top-1/2 left-3 -translate-y-1/2 rounded-full bg-white/85 p-2.5 text-inkt shadow-zacht backdrop-blur-sm transition-all hover:bg-white lg:opacity-0 lg:group-hover:opacity-100"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => ga(1)}
                aria-label="Volgende foto"
                className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full bg-white/85 p-2.5 text-inkt shadow-zacht backdrop-blur-sm transition-all hover:bg-white lg:opacity-0 lg:group-hover:opacity-100"
              >
                <ChevronRight className="size-4" />
              </button>
            </>
          ) : null}
        </div>

        {afbeeldingen.length > 1 ? (
          <Badge variant="wit" size="sm" className="absolute bottom-4 left-4 lg:hidden">
            {actief + 1} / {afbeeldingen.length}
          </Badge>
        ) : null}
      </div>
    </div>
  );
}
