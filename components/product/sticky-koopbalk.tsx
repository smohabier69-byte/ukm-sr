"use client";

import * as React from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useWinkelwagen } from "@/lib/winkel/stores";
import { formatPrijs } from "@/lib/format";
import type { Product } from "@/types/product";

/**
 * Balk die verschijnt zodra de hoofdkoopblok (met de #koopblok-anker) buiten
 * beeld scrolt, zodat "toevoegen" op een lange productpagina bereikbaar
 * blijft. Bij een product met varianten scrollt de knop terug naar boven in
 * plaats van blind een variant te kiezen.
 */
export function StickyKoopbalk({ product }: { product: Product }) {
  const [zichtbaar, setZichtbaar] = React.useState(false);
  const heeftVarianten = product.varianten.length > 0;
  const voegToe = useWinkelwagen((staat) => staat.voegToe);

  React.useEffect(() => {
    const anker = document.getElementById("koopblok");
    if (!anker) return;

    const observer = new IntersectionObserver(([entry]) => setZichtbaar(!entry.isIntersecting), {
      rootMargin: "-64px 0px 0px 0px",
    });
    observer.observe(anker);
    return () => observer.disconnect();
  }, []);

  const uitverkocht = heeftVarianten ? product.varianten.every((v) => v.voorraad === 0) : product.voorraad === 0;

  const actie = () => {
    if (heeftVarianten) {
      document.getElementById("koopblok")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    voegToe(product.slug, 1);
    toast.success("Toegevoegd aan winkelwagen", { description: product.naam });
  };

  return (
    <AnimatePresence>
      {zichtbaar ? (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="glas fixed inset-x-0 bottom-0 z-40 border-t border-border/60"
        >
          <div className="container-ukm flex items-center gap-4 py-3">
            <div className="relative hidden size-12 shrink-0 overflow-hidden rounded-xl bg-creme-diep sm:block">
              <Image src={product.afbeeldingen[0]} alt="" fill sizes="48px" className="object-cover object-top" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{product.naam}</p>
              <p className="text-sm font-semibold text-inkt-zacht">{formatPrijs(product.prijs)}</p>
            </div>
            <Button onClick={actie} disabled={uitverkocht} className="shrink-0">
              <ShoppingBag />
              {uitverkocht ? "Uitverkocht" : heeftVarianten ? "Kies uitvoering" : "In winkelwagen"}
            </Button>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
