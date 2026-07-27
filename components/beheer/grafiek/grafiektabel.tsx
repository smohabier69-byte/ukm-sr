"use client";

import * as React from "react";
import { ChevronDown, Table2 } from "lucide-react";

import type { Reeks } from "./lijngrafiek";
import { opmaakVan, type Eenheid } from "./opmaak";
import { cn } from "@/lib/utils";

/**
 * Tabelweergave naast elke grafiek.
 *
 * Kleur mag nooit de enige drager van betekenis zijn. Wie de reeksen niet uit
 * elkaar kan houden - of een schermlezer gebruikt - leest hier dezelfde cijfers.
 */
export function Grafiektabel({
  labels,
  reeksen,
  eenheid,
  kolomkop = "Periode",
}: {
  labels: string[];
  reeksen: Reeks[];
  eenheid: Eenheid;
  kolomkop?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const opmaak = opmaakVan(eenheid);

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 text-xs text-inkt-zacht transition-colors hover:text-inkt"
      >
        <Table2 className="size-3.5" />
        Cijfers als tabel
        <ChevronDown className={cn("size-3.5 transition-transform duration-300", open && "rotate-180")} />
      </button>

      {open ? (
        <div className="mt-3 max-h-64 overflow-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-creme-diep">
              <tr>
                <th scope="col" className="px-3 py-2 text-left font-medium">
                  {kolomkop}
                </th>
                {reeksen.map((reeks) => (
                  <th key={reeks.naam} scope="col" className="px-3 py-2 text-right font-medium">
                    {reeks.naam}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {labels.map((label, i) => (
                <tr key={label + i}>
                  <th scope="row" className="px-3 py-2 text-left font-normal text-inkt-zacht">
                    {label}
                  </th>
                  {reeksen.map((reeks) => (
                    <td key={reeks.naam} className="px-3 py-2 text-right tabular-nums">
                      {opmaak(reeks.waarden[i])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
