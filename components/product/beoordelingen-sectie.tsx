import { BadgeCheck } from "lucide-react";

import { Sterren } from "@/components/product/sterren";
import { beoordelingenVoor, scoreverdeling } from "@/data/beoordelingen";
import { formatDatumLang } from "@/lib/format";
import type { Product } from "@/types/product";

export function BeoordelingenSectie({ product }: { product: Product }) {
  const beoordelingen = beoordelingenVoor(product);
  const verdeling = scoreverdeling(beoordelingen);
  const totaal = beoordelingen.length;

  return (
    <div className="grid gap-10 lg:grid-cols-[18rem_1fr] lg:gap-16">
      <div>
        <p className="font-display text-5xl font-bold">{product.score.toFixed(1).replace(".", ",")}</p>
        <Sterren score={product.score} className="mt-3" />
        <p className="mt-2 text-sm text-inkt-zacht">
          Gebaseerd op {product.aantalBeoordelingen} beoordelingen
        </p>

        <div className="mt-6 space-y-2">
          {verdeling.map((rij) => (
            <div key={rij.ster} className="flex items-center gap-3 text-xs">
              <span className="w-8 shrink-0 text-inkt-zacht">{rij.ster} ster</span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-salie-100">
                <div
                  className="h-full rounded-full bg-goud"
                  style={{ width: `${totaal ? (rij.aantal / totaal) * 100 : 0}%` }}
                />
              </div>
              <span className="w-4 shrink-0 text-right text-inkt-zacht tabular-nums">{rij.aantal}</span>
            </div>
          ))}
        </div>
      </div>

      <ul className="divide-y divide-border">
        {beoordelingen.map((beoordeling) => (
          <li key={beoordeling.id} className="py-6 first:pt-0">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <span className="font-medium">{beoordeling.naam}</span>
              {beoordeling.geverifieerd ? (
                <span className="inline-flex items-center gap-1 text-xs text-salie-700">
                  <BadgeCheck className="size-3.5" />
                  Geverifieerde koop
                </span>
              ) : null}
              <span className="text-xs text-inkt-zacht">{formatDatumLang(beoordeling.datum)}</span>
            </div>

            <Sterren score={beoordeling.score} className="mt-2.5" compact />
            <p className="mt-3 font-display font-semibold">{beoordeling.titel}</p>
            <p className="mt-1.5 leading-relaxed text-inkt-zacht">{beoordeling.tekst}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
