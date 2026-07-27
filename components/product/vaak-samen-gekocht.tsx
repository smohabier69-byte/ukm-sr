"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useWinkelwagen } from "@/lib/winkel/stores";
import { formatPrijs } from "@/lib/format";
import type { Product } from "@/types/product";

/**
 * Combinatieblok. Het hoofdproduct staat vast aangevinkt; de suggesties kunnen
 * los worden uitgezet, zodat het totaalbedrag meebeweegt met wat je echt afneemt.
 */
export function VaakSamenGekocht({ hoofdproduct, suggesties }: { hoofdproduct: Product; suggesties: Product[] }) {
  const [gekozen, setGekozen] = React.useState<string[]>(suggesties.map((p) => p.slug));
  const voegToe = useWinkelwagen((staat) => staat.voegToe);

  if (suggesties.length === 0) return null;

  const meegenomen = [hoofdproduct, ...suggesties.filter((p) => gekozen.includes(p.slug))];
  const totaal = meegenomen.reduce((som, p) => som + p.prijs, 0);

  const allesToevoegen = () => {
    for (const product of meegenomen) {
      voegToe(product.slug, 1, product.varianten[0]?.id);
    }
    toast.success(`${meegenomen.length} artikelen toegevoegd`, {
      description: `Totaal ${formatPrijs(totaal)}`,
      action: { label: "Bekijken", onClick: () => (window.location.href = "/winkelwagen") },
    });
  };

  return (
    <div className="rounded-3xl border border-border/70 bg-white p-6 sm:p-8">
      <h2 className="font-display text-xl font-semibold">Vaak samen gekocht</h2>

      <div className="mt-7 flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          {[hoofdproduct, ...suggesties].map((product, i) => (
            <React.Fragment key={product.slug}>
              {i > 0 ? <Plus className="size-4 shrink-0 text-inkt-zacht" /> : null}
              <Link
                href={`/producten/${product.slug}`}
                className="relative aspect-[3/4] w-24 shrink-0 overflow-hidden rounded-xl bg-creme-diep transition-opacity hover:opacity-85"
              >
                <Image
                  src={product.afbeeldingen[0]}
                  alt={product.naam}
                  fill
                  sizes="96px"
                  className="object-cover object-top"
                />
              </Link>
            </React.Fragment>
          ))}
        </div>

        <div className="min-w-0 flex-1 xl:max-w-md">
          <ul className="space-y-2.5">
            <li className="flex items-start gap-3 text-sm">
              <Checkbox checked disabled aria-label="Dit artikel" className="mt-0.5" />
              <span className="flex-1">
                <span className="font-medium">Dit artikel:</span> {hoofdproduct.naam}
              </span>
              <span className="shrink-0 font-medium">{formatPrijs(hoofdproduct.prijs)}</span>
            </li>

            {suggesties.map((product) => (
              <li key={product.slug} className="flex items-start gap-3 text-sm">
                <Checkbox
                  id={`combi-${product.slug}`}
                  checked={gekozen.includes(product.slug)}
                  onCheckedChange={(aan) =>
                    setGekozen((vorige) =>
                      aan === true ? [...vorige, product.slug] : vorige.filter((s) => s !== product.slug),
                    )
                  }
                  className="mt-0.5"
                />
                <label htmlFor={`combi-${product.slug}`} className="flex-1 cursor-pointer">
                  {product.naam}
                </label>
                <span className="shrink-0 font-medium">{formatPrijs(product.prijs)}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-5">
            <div>
              <p className="text-xs text-inkt-zacht">Totaal voor {meegenomen.length} artikelen</p>
              <p className="font-display text-xl font-bold">{formatPrijs(totaal)}</p>
            </div>
            <Button onClick={allesToevoegen}>
              <ShoppingBag />
              Alles toevoegen
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
