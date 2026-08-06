import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Tag } from "lucide-react";

import { Paginakop } from "@/components/catalogus/paginakop";
import { Productkaart } from "@/components/product/productkaart";
import { Button } from "@/components/ui/button";
import { OnthulGroep, OnthulKind } from "@/components/motion/onthul";
import { aanbiedingen, bestsellers } from "@/lib/square/producten";
import { formatKorting, formatPrijs } from "@/lib/format";

export const metadata: Metadata = {
  title: "Aanbiedingen",
  description: "De lopende acties van UKM.sr. Zolang de voorraad strekt.",
  alternates: { canonical: "/aanbiedingen" },
};

export default async function Aanbiedingenpagina() {
  const [aanbiedingenLijst, bestsellersLijst] = await Promise.all([aanbiedingen(), bestsellers()]);
  const grootsteKorting = aanbiedingenLijst.reduce(
    (hoogste, p) => Math.max(hoogste, formatKorting(p.vanPrijs ?? p.prijs, p.prijs)),
    0,
  );

  return (
    <>
      <Paginakop
        kruimels={[{ label: "Home", href: "/" }, { label: "Aanbiedingen" }]}
        titel="Aanbiedingen"
        tekst={
          aanbiedingenLijst.length > 0
            ? `Lopende acties uit het assortiment, met kortingen tot ${grootsteKorting}%. Zolang de voorraad strekt.`
            : "Op dit moment lopen er geen acties. Bekijk hieronder wat op dit moment het best verkoopt."
        }
        aantal={aanbiedingenLijst.length > 0 ? aanbiedingenLijst.length : undefined}
      />

      <section className="container-ukm py-10 lg:py-14">
        {aanbiedingenLijst.length > 0 ? (
          <>
            <div className="mb-10 flex items-center gap-3 rounded-2xl border border-koraal/20 bg-koraal/5 px-5 py-4">
              <Tag className="size-5 shrink-0 text-koraal" />
              <p className="text-sm text-inkt-zacht">
                Actieprijzen gelden zolang de voorraad strekt. Vragen over een model?{" "}
                <Link href="/contact" className="font-medium text-salie-700 underline underline-offset-4">
                  Neem contact op
                </Link>
                .
              </p>
            </div>

            <OnthulGroep className="grid grid-cols-2 gap-x-5 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
              {aanbiedingenLijst.map((product, i) => (
                <OnthulKind key={product.id}>
                  <Productkaart product={product} prioriteit={i < 4} />
                </OnthulKind>
              ))}
            </OnthulGroep>
          </>
        ) : null}

        <div className="mt-20">
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-display text-[0.6875rem] font-semibold tracking-[0.14em] text-salie-600 uppercase">
                Ook interessant
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold">Scherp geprijsd en veel verkocht</h2>
            </div>
            <Button asChild variant="outline">
              <Link href="/producten?sorteer=prijs-op">
                Sorteer op laagste prijs
                <ArrowRight />
              </Link>
            </Button>
          </div>

          <OnthulGroep className="grid grid-cols-2 gap-x-5 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
            {bestsellersLijst.slice(0, 4).map((product) => (
              <OnthulKind key={product.id}>
                <Productkaart product={product} />
              </OnthulKind>
            ))}
          </OnthulGroep>
        </div>

        {aanbiedingenLijst.length > 0 ? (
          <p className="mt-14 text-center text-sm text-inkt-zacht">
            Voordeligste artikel op dit moment:{" "}
            <span className="font-medium text-inkt">
              {formatPrijs(Math.min(...aanbiedingenLijst.map((p) => p.prijs)))}
            </span>
          </p>
        ) : null}
      </section>
    </>
  );
}
