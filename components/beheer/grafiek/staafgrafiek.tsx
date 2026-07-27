"use client";

import * as React from "react";

import { opmaakVan, type Eenheid } from "./opmaak";
import { cn } from "@/lib/utils";

export interface Staaf {
  label: string;
  waarde: number;
}

/**
 * Horizontale staven voor een meting over meerdere categorieen.
 *
 * Een reeks, dus een kleur: hier vergelijk je grootte, niet identiteit, en
 * verschillende kleuren zouden een onderscheid suggereren dat er niet is.
 * De waarde staat aan het uiteinde van de staaf, zodat er geen as nodig is.
 */
export function Staafgrafiek({
  staven,
  eenheid,
  kleur = "var(--viz-serie-1)",
  className,
}: {
  staven: Staaf[];
  eenheid: Eenheid;
  kleur?: string;
  className?: string;
}) {
  const maximum = Math.max(1, ...staven.map((s) => s.waarde));
  const opmaak = opmaakVan(eenheid);

  return (
    <ul className={cn("space-y-3.5", className)}>
      {staven.map((staaf) => {
        const breedte = (staaf.waarde / maximum) * 100;
        return (
          <li key={staaf.label}>
            <div className="mb-1.5 flex items-baseline justify-between gap-4">
              <span className="truncate text-sm text-inkt">{staaf.label}</span>
              <span className="shrink-0 text-sm font-medium tabular-nums">{opmaak(staaf.waarde)}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-r-[4px] bg-creme-diep">
              <div
                className="h-full rounded-r-[4px] transition-[width] duration-700 ease-[var(--ease-uit)]"
                style={{ width: `${Math.max(1.5, breedte)}%`, backgroundColor: kleur }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Kolommen voor een reeks over de tijd, bijvoorbeeld bestellingen per dag.
 * De staafdikte is begrensd zodat er bij weinig punten lucht overblijft.
 */
export function Kolomgrafiek({
  punten,
  eenheid,
  hoogte = 132,
  className,
}: {
  punten: { label: string; waarde: number }[];
  eenheid: Eenheid;
  hoogte?: number;
  className?: string;
}) {
  const [actief, setActief] = React.useState<number | null>(null);
  const maximum = Math.max(1, ...punten.map((p) => p.waarde));
  const opmaak = opmaakVan(eenheid);

  return (
    <div className={cn("relative", className)}>
      <div className="flex items-end gap-[2px]" style={{ height: hoogte }}>
        {punten.map((punt, i) => (
          <button
            key={punt.label + i}
            type="button"
            onMouseEnter={() => setActief(i)}
            onMouseLeave={() => setActief(null)}
            onFocus={() => setActief(i)}
            onBlur={() => setActief(null)}
            aria-label={`${punt.label}: ${opmaak(punt.waarde)}`}
            className="group flex h-full max-w-6 flex-1 items-end"
          >
            <span
              className="w-full rounded-t-[4px] transition-colors duration-200"
              style={{
                height: `${Math.max(2, (punt.waarde / maximum) * 100)}%`,
                backgroundColor: actief === i ? "var(--viz-serie-1)" : "color-mix(in srgb, var(--viz-serie-1) 55%, white)",
              }}
            />
          </button>
        ))}
      </div>

      {actief !== null ? (
        <div
          role="status"
          className="pointer-events-none absolute -top-1 z-10 -translate-x-1/2 -translate-y-full rounded-xl border border-border bg-white px-3 py-1.5 shadow-zwevend"
          style={{ left: `${((actief + 0.5) / punten.length) * 100}%` }}
        >
          <p className="text-[11px] text-inkt-zacht">{punten[actief].label}</p>
          <p className="text-xs font-medium tabular-nums">{opmaak(punten[actief].waarde)}</p>
        </div>
      ) : null}
    </div>
  );
}
