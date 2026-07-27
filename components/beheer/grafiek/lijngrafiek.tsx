"use client";

import * as React from "react";

import { asstappen, kortGetal, useBreedte, vloeiendPad } from "./hulpmiddelen";
import { Grafiektabel } from "./grafiektabel";
import { opmaakVan, type Eenheid } from "./opmaak";
import { cn } from "@/lib/utils";

export interface Reeks {
  naam: string;
  kleur: string;
  waarden: number[];
}

const MARGE = { boven: 16, rechts: 16, onder: 30, links: 52 };
const HOOGTE = 260;

/**
 * Lijn- of vlakgrafiek voor een of twee reeksen.
 *
 * Volgt de vaste maatvoering: 2px lijn met ronde uiteinden, vlakvulling op tien
 * procent dekking, hairline raster en markers van minstens acht pixels met een
 * ring in de achtergrondkleur. Bij twee reeksen hoort altijd een legenda; bij
 * een reeks niet, want de titel zegt dan al wat er staat.
 */
export function Lijngrafiek({
  labels,
  reeksen,
  eenheid,
  metVlak = true,
  hoogte = HOOGTE,
  className,
}: {
  labels: string[];
  reeksen: Reeks[];
  eenheid: Eenheid;
  metVlak?: boolean;
  hoogte?: number;
  className?: string;
}) {
  const [ref, breedte] = useBreedte<HTMLDivElement>();
  const [actief, setActief] = React.useState<number | null>(null);
  const opmaak = opmaakVan(eenheid);

  const maximum = Math.max(1, ...reeksen.flatMap((r) => r.waarden));
  const stappen = asstappen(maximum);
  const bovengrens = stappen[stappen.length - 1];

  const tekenBreedte = Math.max(0, breedte - MARGE.links - MARGE.rechts);
  const tekenHoogte = hoogte - MARGE.boven - MARGE.onder;

  const xVan = (i: number) =>
    MARGE.links + (labels.length <= 1 ? tekenBreedte / 2 : (i / (labels.length - 1)) * tekenBreedte);
  const yVan = (waarde: number) => MARGE.boven + tekenHoogte - (waarde / bovengrens) * tekenHoogte;

  // Toon niet elk maandlabel op smalle schermen; anders lopen ze in elkaar.
  const labelStap = Math.max(1, Math.ceil(labels.length / Math.max(3, Math.floor(breedte / 64))));

  const bijBeweging = (e: React.PointerEvent<SVGSVGElement>) => {
    if (tekenBreedte <= 0) return;
    const vlak = e.currentTarget.getBoundingClientRect();
    const verhouding = (e.clientX - vlak.left - MARGE.links) / tekenBreedte;
    const index = Math.round(verhouding * (labels.length - 1));
    setActief(Math.min(labels.length - 1, Math.max(0, index)));
  };

  return (
    <div className={cn("w-full", className)}>
      {reeksen.length > 1 ? (
        <ul className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-2">
          {reeksen.map((reeks) => (
            <li key={reeks.naam} className="flex items-center gap-2 text-xs text-inkt-zacht">
              <span className="size-2.5 rounded-full" style={{ backgroundColor: reeks.kleur }} />
              {reeks.naam}
            </li>
          ))}
        </ul>
      ) : null}

      <div ref={ref} className="relative w-full">
        {breedte > 0 ? (
          <svg
            width={breedte}
            height={hoogte}
            role="img"
            aria-label={`Grafiek: ${reeksen.map((r) => r.naam).join(" en ")}`}
            onPointerMove={bijBeweging}
            onPointerLeave={() => setActief(null)}
            className="touch-none"
          >
            {stappen.map((stap) => (
              <g key={stap}>
                <line
                  x1={MARGE.links}
                  x2={breedte - MARGE.rechts}
                  y1={yVan(stap)}
                  y2={yVan(stap)}
                  stroke="var(--viz-raster)"
                  strokeWidth={1}
                />
                <text
                  x={MARGE.links - 10}
                  y={yVan(stap)}
                  textAnchor="end"
                  dominantBaseline="middle"
                  className="fill-[var(--viz-gedempt)] text-[11px] tabular-nums"
                >
                  {kortGetal(stap)}
                </text>
              </g>
            ))}

            {labels.map((label, i) =>
              i % labelStap === 0 || i === labels.length - 1 ? (
                <text
                  key={label + i}
                  x={xVan(i)}
                  y={hoogte - 10}
                  textAnchor="middle"
                  className="fill-[var(--viz-gedempt)] text-[11px]"
                >
                  {label}
                </text>
              ) : null,
            )}

            {actief !== null ? (
              <line
                x1={xVan(actief)}
                x2={xVan(actief)}
                y1={MARGE.boven}
                y2={MARGE.boven + tekenHoogte}
                stroke="var(--viz-as)"
                strokeWidth={1}
              />
            ) : null}

            {reeksen.map((reeks) => {
              const punten = reeks.waarden.map((waarde, i) => ({ x: xVan(i), y: yVan(waarde) }));
              const lijn = vloeiendPad(punten);
              const basis = MARGE.boven + tekenHoogte;

              return (
                <g key={reeks.naam}>
                  {metVlak ? (
                    <path
                      d={`${lijn} L${punten[punten.length - 1].x},${basis} L${punten[0].x},${basis} Z`}
                      fill={reeks.kleur}
                      opacity={0.1}
                    />
                  ) : null}
                  <path
                    d={lijn}
                    fill="none"
                    stroke={reeks.kleur}
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {actief !== null ? (
                    <circle
                      cx={punten[actief].x}
                      cy={punten[actief].y}
                      r={5}
                      fill={reeks.kleur}
                      stroke="var(--card)"
                      strokeWidth={2}
                    />
                  ) : null}
                </g>
              );
            })}
          </svg>
        ) : (
          <div style={{ height: hoogte }} />
        )}

        {actief !== null && breedte > 0 ? (
          <div
            role="status"
            className="pointer-events-none absolute z-10 min-w-36 -translate-x-1/2 rounded-xl border border-border bg-white px-3 py-2 shadow-zwevend"
            style={{
              left: Math.min(Math.max(xVan(actief), 80), breedte - 80),
              top: 0,
            }}
          >
            <p className="text-[11px] font-medium text-inkt-zacht">{labels[actief]}</p>
            <ul className="mt-1 space-y-0.5">
              {reeksen.map((reeks) => (
                <li key={reeks.naam} className="flex items-center gap-2 text-xs">
                  <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: reeks.kleur }} />
                  <span className="flex-1 text-inkt-zacht">{reeks.naam}</span>
                  <span className="font-medium tabular-nums">{opmaak(reeks.waarden[actief])}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      <Grafiektabel labels={labels} reeksen={reeksen} eenheid={eenheid} />
    </div>
  );
}
