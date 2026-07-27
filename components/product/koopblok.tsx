"use client";

import * as React from "react";
import Link from "next/link";
import { Check, Minus, Plus, ShoppingBag, Truck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { VerlanglijstKnop } from "@/components/product/verlanglijst-knop";
import { useWinkelwagen } from "@/lib/winkel/stores";
import { formatKorting, formatPrijs } from "@/lib/format";
import { bedrijf } from "@/lib/site";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/product";

const MAX_AANTAL = 10;

export function Koopblok({ product }: { product: Product }) {
  const heeftVarianten = product.varianten.length > 0;
  const [variantId, setVariantId] = React.useState<string | undefined>(
    heeftVarianten ? product.varianten[0].id : undefined,
  );
  const [aantal, setAantal] = React.useState(1);

  const variant = product.varianten.find((v) => v.id === variantId);
  const prijs = variant?.prijs ?? product.prijs;
  const voorraad = heeftVarianten ? (variant?.voorraad ?? 0) : product.voorraad;
  const uitverkocht = voorraad === 0;
  const korting = product.vanPrijs ? formatKorting(product.vanPrijs, prijs) : 0;

  const voegToe = useWinkelwagen((staat) => staat.voegToe);

  const inWinkelwagen = () => {
    voegToe(product.slug, aantal, variantId);
    toast.success("Toegevoegd aan winkelwagen", {
      description: `${aantal}x ${product.naam}${variant ? ` - ${variant.naam}` : ""}`,
      action: { label: "Bekijken", onClick: () => (window.location.href = "/winkelwagen") },
    });
  };

  return (
    <div>
      <div className="flex flex-wrap items-baseline gap-3">
        <span className="font-display text-3xl font-bold">{formatPrijs(prijs)}</span>
        {product.vanPrijs ? (
          <>
            <span className="text-lg text-inkt-zacht line-through">{formatPrijs(product.vanPrijs)}</span>
            <span className="rounded-full bg-koraal/10 px-2.5 py-1 text-xs font-medium text-koraal">
              Je bespaart {korting}%
            </span>
          </>
        ) : null}
      </div>
      <p className="mt-1.5 text-xs text-inkt-zacht">Inclusief BTW</p>

      {heeftVarianten ? (
        <fieldset className="mt-8">
          <legend className="mb-3 text-sm font-medium">
            Uitvoering: <span className="text-inkt-zacht">{variant?.naam}</span>
          </legend>
          <div className="flex flex-wrap gap-2.5">
            {product.varianten.map((optie) => {
              const gekozen = optie.id === variantId;
              const leeg = optie.voorraad === 0;
              return (
                <button
                  key={optie.id}
                  type="button"
                  onClick={() => {
                    setVariantId(optie.id);
                    setAantal(1);
                  }}
                  aria-pressed={gekozen}
                  className={cn(
                    "flex items-center gap-2 rounded-full border py-2 pr-4 pl-2.5 text-sm transition-all duration-300",
                    gekozen ? "border-salie-700 bg-salie-50" : "border-border hover:border-salie-400",
                    leeg && "opacity-45",
                  )}
                >
                  <span
                    className="size-4 rounded-full ring-1 ring-inkt/10"
                    style={{ backgroundColor: optie.swatch }}
                  />
                  {optie.naam}
                  {optie.prijs && optie.prijs !== product.prijs ? (
                    <span className="text-xs text-inkt-zacht">{formatPrijs(optie.prijs)}</span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </fieldset>
      ) : null}

      <div className="mt-7 flex items-center gap-2 text-sm">
        {uitverkocht ? (
          <span className="text-inkt-zacht">Tijdelijk uitverkocht</span>
        ) : (
          <>
            <span className="flex size-5 items-center justify-center rounded-full bg-salie-100 text-salie-700">
              <Check className="size-3 stroke-[3]" />
            </span>
            <span>
              {voorraad <= 4 ? (
                <span className="text-koraal">Nog {voorraad} op voorraad</span>
              ) : (
                "Op voorraad, klaar om te verzenden"
              )}
            </span>
          </>
        )}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="flex items-center rounded-full border border-border">
          <button
            type="button"
            onClick={() => setAantal((v) => Math.max(1, v - 1))}
            disabled={aantal <= 1 || uitverkocht}
            aria-label="Aantal verlagen"
            className="rounded-full p-3 transition-colors hover:bg-salie-50 disabled:opacity-35 disabled:hover:bg-transparent"
          >
            <Minus className="size-4" />
          </button>
          <span className="w-10 text-center text-sm font-medium tabular-nums" aria-live="polite">
            {aantal}
          </span>
          <button
            type="button"
            onClick={() => setAantal((v) => Math.min(Math.min(MAX_AANTAL, voorraad), v + 1))}
            disabled={aantal >= Math.min(MAX_AANTAL, voorraad) || uitverkocht}
            aria-label="Aantal verhogen"
            className="rounded-full p-3 transition-colors hover:bg-salie-50 disabled:opacity-35 disabled:hover:bg-transparent"
          >
            <Plus className="size-4" />
          </button>
        </div>

        <Button size="lg" className="flex-1 min-w-48" onClick={inWinkelwagen} disabled={uitverkocht}>
          <ShoppingBag />
          {uitverkocht ? "Uitverkocht" : "In winkelwagen"}
        </Button>

        <VerlanglijstKnop slug={product.slug} naam={product.naam} variant="volledig" />
      </div>

      <div className="mt-7 flex items-start gap-3 rounded-2xl bg-salie-50 p-4 text-sm">
        <Truck className="mt-0.5 size-4 shrink-0 text-salie-700" />
        <p className="text-inkt-zacht">
          Bezorging in {bedrijf.adres.stad} vanaf {formatPrijs(bedrijf.bezorgingVanaf)}, gratis boven{" "}
          {formatPrijs(bedrijf.gratisBezorgingVanaf)}. Zelf afhalen kan aan de {bedrijf.adres.straat}.{" "}
          <Link href="/veelgestelde-vragen#bezorging" className="font-medium text-salie-700 underline underline-offset-4">
            Voorwaarden
          </Link>
        </p>
      </div>
    </div>
  );
}
