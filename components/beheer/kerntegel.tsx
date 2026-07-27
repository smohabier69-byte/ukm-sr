"use client";

import { TrendingDown, TrendingUp } from "lucide-react";

import { vloeiendPad } from "./grafiek/hulpmiddelen";
import { formatAantal, formatPrijs } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Kerncijfer } from "@/data/beheer/statistieken";

const BREEDTE = 116;
const HOOGTE = 34;

/**
 * Kerncijfer met vergelijking en een klein verloop.
 *
 * De richting van de verandering staat in een pijl en in de tekst, niet alleen
 * in de kleur: rood en groen zijn voor een deel van de lezers niet te
 * onderscheiden.
 */
export function Kerntegel({ cijfer }: { cijfer: Kerncijfer }) {
  const opmaak = cijfer.eenheid === "srd" ? formatPrijs : formatAantal;

  const verschil = cijfer.vorigeWaarde === 0 ? 0 : ((cijfer.waarde - cijfer.vorigeWaarde) / cijfer.vorigeWaarde) * 100;
  const stijgt = verschil >= 0;
  const Pijl = stijgt ? TrendingUp : TrendingDown;

  const maximum = Math.max(1, ...cijfer.reeks);
  const punten = cijfer.reeks.map((waarde, i) => ({
    x: (i / Math.max(1, cijfer.reeks.length - 1)) * BREEDTE,
    y: HOOGTE - (waarde / maximum) * (HOOGTE - 4) - 2,
  }));

  return (
    <div className="rounded-2xl border border-border/70 bg-white p-5">
      <p className="text-sm text-inkt-zacht">{cijfer.label}</p>

      <div className="mt-2 flex items-end justify-between gap-4">
        <div>
          <p className="font-display text-2xl font-bold">{opmaak(cijfer.waarde)}</p>

          <p
            className={cn(
              "mt-1.5 flex items-center gap-1 text-xs font-medium",
              stijgt ? "text-[var(--status-goed)]" : "text-[var(--status-kritiek)]",
            )}
          >
            <Pijl className="size-3.5" />
            {stijgt ? "+" : ""}
            {verschil.toFixed(1).replace(".", ",")}%
            <span className="font-normal text-inkt-zacht">vs vorige 30 dagen</span>
          </p>
        </div>

        <svg width={BREEDTE} height={HOOGTE} aria-hidden className="shrink-0">
          <path
            d={vloeiendPad(punten)}
            fill="none"
            stroke="var(--viz-serie-1)"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}
