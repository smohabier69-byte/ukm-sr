import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Paginakop } from "@/components/catalogus/paginakop";
import { OnthulGroep, OnthulKind } from "@/components/motion/onthul";
import { merken } from "@/data/merken";
import { aantalPerMerk, productenVanMerk } from "@/lib/square/producten";
import { formatPrijs } from "@/lib/format";

export const metadata: Metadata = {
  title: "Merken en huislijnen",
  description:
    "UKM.sr voert geen externe merken maar zes eigen huislijnen, elk met een eigen techniek en prijsklasse.",
  alternates: { canonical: "/merken" },
};

export default async function Merkenpagina() {
  const aantallen = await aantalPerMerk();
  const merkProductLijsten = await Promise.all(merken.map((merk) => productenVanMerk(merk.slug)));

  return (
    <>
      <Paginakop
        kruimels={[{ label: "Home", href: "/" }, { label: "Merken" }]}
        titel="Merken en huislijnen"
        tekst="UKM voert geen externe merken. Het assortiment is verdeeld over zes eigen lijnen, zodat techniek en prijsklasse meteen duidelijk zijn."
      />

      <section className="container-ukm py-10 lg:py-14">
        <OnthulGroep className="grid gap-6 lg:grid-cols-2">
          {merken.map((merk, index) => {
            const lijst = merkProductLijsten[index];
            const vanafPrijs = lijst.length ? Math.min(...lijst.map((p) => p.prijs)) : 0;
            const voorbeelden = lijst.slice(0, 3);

            return (
              <OnthulKind key={merk.slug}>
                <Link
                  href={`/merken/${merk.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-3xl border border-border/70 bg-white transition-all duration-500 ease-[var(--ease-uit)] hover:-translate-y-1 hover:shadow-kaart"
                >
                  <div className="grid grid-cols-3 gap-px bg-border/60">
                    {voorbeelden.map((product) => (
                      <div key={product.id} className="relative aspect-square bg-creme-diep">
                        <Image
                          src={product.afbeeldingen[0]}
                          alt=""
                          fill
                          sizes="(min-width: 1024px) 16vw, 33vw"
                          className="object-cover object-top transition-transform duration-700 ease-[var(--ease-uit)] group-hover:scale-105"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-1 flex-col p-7">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="font-display text-xl font-semibold">{merk.naam}</h2>
                        <p className="mt-1 text-sm text-salie-600">{merk.positionering}</p>
                      </div>
                      <ArrowUpRight className="size-5 shrink-0 text-inkt-zacht transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-salie-700" />
                    </div>

                    <p className="mt-4 flex-1 text-sm leading-relaxed text-inkt-zacht">{merk.omschrijving}</p>

                    <div className="mt-6 flex items-center justify-between border-t border-border pt-5 text-sm">
                      <span className="text-inkt-zacht">{aantallen[merk.slug] ?? 0} artikelen</span>
                      <span className="font-medium">vanaf {formatPrijs(vanafPrijs)}</span>
                    </div>
                  </div>
                </Link>
              </OnthulKind>
            );
          })}
        </OnthulGroep>
      </section>
    </>
  );
}
