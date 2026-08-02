"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, ShoppingBag, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Productkaart } from "@/components/product/productkaart";
import { useWinkelwagen } from "@/lib/winkel/stores";
import { useVerlanglijstActies, useVerlanglijstGereed, useVerlanglijstSlugs } from "@/lib/winkel/verlanglijst-actief";
import type { Product } from "@/types/product";

/**
 * De verlanglijst bestaat alleen in de browser, dus de catalogus komt via een
 * dynamische import binnen in plaats van als prop uit de server.
 */
export function VerlanglijstInhoud() {
  const gehydrateerd = useVerlanglijstGereed();
  const slugs = useVerlanglijstSlugs();
  const { verwijder, leegmaken } = useVerlanglijstActies();
  const voegToe = useWinkelwagen((staat) => staat.voegToe);

  const [catalogus, setCatalogus] = React.useState<Product[]>([]);
  const [laadt, setLaadt] = React.useState(true);

  React.useEffect(() => {
    if (!gehydrateerd) return;
    if (slugs.length === 0) {
      setLaadt(false);
      return;
    }
    let geannuleerd = false;
    import("@/data/producten").then((module) => {
      if (geannuleerd) return;
      setCatalogus(module.producten);
      setLaadt(false);
    });
    return () => {
      geannuleerd = true;
    };
  }, [gehydrateerd, slugs.length]);

  if (!gehydrateerd || laadt) {
    return (
      <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:gap-x-6 lg:grid-cols-4" aria-busy>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i}>
            <Skeleton className="aspect-[3/4] w-full rounded-2xl" />
            <Skeleton className="mt-4 h-4 w-3/4" />
            <Skeleton className="mt-2 h-3 w-full" />
          </div>
        ))}
      </div>
    );
  }

  const producten = slugs
    .map((slug) => catalogus.find((p) => p.slug === slug))
    .filter((p): p is Product => Boolean(p));

  if (producten.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-3xl border border-dashed border-border bg-white/60 px-6 py-24 text-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-salie-100 text-salie-700">
          <Heart className="size-7" />
        </span>
        <h2 className="mt-7 font-display text-2xl font-semibold">Je verlanglijst is nog leeg</h2>
        <p className="mt-3 max-w-sm leading-relaxed text-inkt-zacht">
          Tik op het hartje bij een model om het hier te bewaren. Zo vergelijk je later rustig thuis.
        </p>
        <Button asChild size="lg" className="mt-8">
          <Link href="/producten">Bekijk het assortiment</Link>
        </Button>
      </div>
    );
  }

  const allesInWinkelwagen = () => {
    const beschikbaar = producten.filter((p) => p.voorraad > 0);
    for (const product of beschikbaar) {
      voegToe(product.slug, 1, product.varianten[0]?.id);
    }
    toast.success(`${beschikbaar.length} artikelen toegevoegd`, {
      action: { label: "Winkelwagen", onClick: () => (window.location.href = "/winkelwagen") },
    });
  };

  return (
    <>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-inkt-zacht">
          <span className="font-medium text-inkt">{producten.length}</span>{" "}
          {producten.length === 1 ? "artikel bewaard" : "artikelen bewaard"}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={allesInWinkelwagen} disabled={producten.every((p) => p.voorraad === 0)}>
            <ShoppingBag />
            Alles in winkelwagen
          </Button>
          <button
            type="button"
            onClick={leegmaken}
            className="text-sm text-inkt-zacht underline underline-offset-4 transition-colors hover:text-koraal"
          >
            Lijst leegmaken
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
        <AnimatePresence initial={false}>
          {producten.map((product) => (
            <motion.div
              key={product.id}
              layout
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              <button
                type="button"
                onClick={() => verwijder(product.slug)}
                aria-label={`${product.naam} van verlanglijst halen`}
                className="absolute top-3 right-3 z-10 rounded-full bg-white/90 p-2 text-inkt shadow-zacht backdrop-blur-sm transition-all hover:scale-105 hover:text-koraal"
              >
                <X className="size-4" />
              </button>
              <Productkaart product={product} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}
