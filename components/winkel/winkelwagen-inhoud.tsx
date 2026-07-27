"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Bezorgvoortgang, Kortingscodeveld, Kostenregels } from "@/components/winkel/kostenoverzicht";
import { useWinkelHydratie, useWinkelwagen } from "@/lib/winkel/stores";
import { berekenKosten, bouwPosten } from "@/lib/winkel/prijzen";
import { formatPrijs } from "@/lib/format";

export function WinkelwagenInhoud() {
  const gehydrateerd = useWinkelHydratie();
  const regels = useWinkelwagen((staat) => staat.regels);
  const kortingscode = useWinkelwagen((staat) => staat.kortingscode);
  const wijzigAantal = useWinkelwagen((staat) => staat.wijzigAantal);
  const verwijder = useWinkelwagen((staat) => staat.verwijder);
  const leegmaken = useWinkelwagen((staat) => staat.leegmaken);

  const posten = React.useMemo(() => bouwPosten(regels), [regels]);
  const kosten = React.useMemo(() => berekenKosten(posten, kortingscode), [posten, kortingscode]);

  if (!gehydrateerd) return <WinkelwagenSkelet />;

  if (posten.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-3xl border border-dashed border-border bg-white/60 px-6 py-24 text-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-salie-100 text-salie-700">
          <ShoppingBag className="size-7" />
        </span>
        <h2 className="mt-7 font-display text-2xl font-semibold">Je winkelwagen is leeg</h2>
        <p className="mt-3 max-w-sm leading-relaxed text-inkt-zacht">
          Er staat nog niets in. Bekijk de collectie en voeg een montuur of set lenzen toe.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/categorie/brillen">Bekijk brillen</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/categorie/lenzen">Bekijk lenzen</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_22rem] lg:gap-14">
      <div>
        <ul className="divide-y divide-border border-y border-border">
          <AnimatePresence initial={false}>
            {posten.map((post) => {
              const sleutel = `${post.regel.slug}-${post.regel.variantId ?? ""}`;
              const maximum = Math.min(10, post.variant ? post.variant.voorraad : post.product.voorraad);

              return (
                <motion.li
                  key={sleutel}
                  layout
                  exit={{ opacity: 0, height: 0, marginTop: 0, marginBottom: 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="flex gap-4 overflow-hidden py-6 sm:gap-6"
                >
                  <Link
                    href={`/producten/${post.product.slug}`}
                    className="relative aspect-[3/4] w-24 shrink-0 overflow-hidden rounded-xl bg-creme-diep sm:w-28"
                  >
                    <Image
                      src={post.product.afbeeldingen[0]}
                      alt={post.product.naam}
                      fill
                      sizes="112px"
                      className="object-cover object-top"
                    />
                  </Link>

                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex justify-between gap-4">
                      <div className="min-w-0">
                        <Link
                          href={`/producten/${post.product.slug}`}
                          className="font-display font-semibold transition-colors hover:text-salie-700"
                        >
                          {post.product.naam}
                        </Link>
                        {post.variant ? (
                          <p className="mt-1 flex items-center gap-1.5 text-sm text-inkt-zacht">
                            <span
                              className="size-3 rounded-full ring-1 ring-inkt/10"
                              style={{ backgroundColor: post.variant.swatch }}
                            />
                            {post.variant.naam}
                          </p>
                        ) : null}
                        <p className="mt-1 text-sm text-inkt-zacht">{formatPrijs(post.stukprijs)} per stuk</p>
                      </div>

                      <p className="shrink-0 font-display font-semibold">{formatPrijs(post.totaal)}</p>
                    </div>

                    <div className="mt-auto flex items-center justify-between gap-4 pt-4">
                      <div className="flex items-center rounded-full border border-border">
                        <button
                          type="button"
                          onClick={() =>
                            wijzigAantal(post.regel.slug, post.regel.aantal - 1, post.regel.variantId)
                          }
                          aria-label={`Aantal ${post.product.naam} verlagen`}
                          className="rounded-full p-2.5 transition-colors hover:bg-salie-50"
                        >
                          <Minus className="size-3.5" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium tabular-nums">
                          {post.regel.aantal}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            wijzigAantal(post.regel.slug, post.regel.aantal + 1, post.regel.variantId)
                          }
                          disabled={post.regel.aantal >= maximum}
                          aria-label={`Aantal ${post.product.naam} verhogen`}
                          className="rounded-full p-2.5 transition-colors hover:bg-salie-50 disabled:opacity-35 disabled:hover:bg-transparent"
                        >
                          <Plus className="size-3.5" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => verwijder(post.regel.slug, post.regel.variantId)}
                        className="inline-flex items-center gap-1.5 text-sm text-inkt-zacht transition-colors hover:text-koraal"
                      >
                        <Trash2 className="size-4" />
                        Verwijderen
                      </button>
                    </div>
                  </div>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <Button asChild variant="ghost" size="sm">
            <Link href="/producten">Verder winkelen</Link>
          </Button>
          <button
            type="button"
            onClick={leegmaken}
            className="text-sm text-inkt-zacht underline underline-offset-4 transition-colors hover:text-koraal"
          >
            Winkelwagen leegmaken
          </button>
        </div>
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-3xl border border-border/70 bg-white p-6 sm:p-7">
          <h2 className="font-display text-lg font-semibold">Overzicht</h2>

          <div className="mt-6 space-y-4">
            <Bezorgvoortgang kosten={kosten} />
            <Kortingscodeveld subtotaal={kosten.subtotaal} />
          </div>

          <div className="mt-6 border-t border-border pt-6">
            <Kostenregels kosten={kosten} />
          </div>

          <Button asChild size="lg" className="mt-7 w-full">
            <Link href="/afrekenen">
              Naar afrekenen
              <ArrowRight />
            </Link>
          </Button>

          <p className="mt-4 text-center text-xs text-inkt-zacht">
            Betalen met contant, bankoverschrijving of pin.
          </p>
        </div>
      </aside>
    </div>
  );
}

function WinkelwagenSkelet() {
  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_22rem] lg:gap-14" aria-busy>
      <div className="space-y-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="flex gap-6 border-b border-border pb-6">
            <Skeleton className="aspect-[3/4] w-28 shrink-0 rounded-xl" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-32 rounded-full" />
            </div>
          </div>
        ))}
      </div>
      <Skeleton className="h-96 rounded-3xl" />
    </div>
  );
}
