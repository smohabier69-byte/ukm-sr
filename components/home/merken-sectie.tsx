import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { OnthulGroep, OnthulKind } from "@/components/motion/onthul";
import { Sectiekop } from "@/components/home/sectiekop";
import { merken } from "@/data/merken";
import { aantalPerMerk } from "@/data/producten";

export function MerkenSectie() {
  const aantallen = aantalPerMerk();

  return (
    <section className="bg-salie-50/70 py-14 lg:py-20">
      <div className="container-ukm">
        <Sectiekop
          bovenschrift="Onze huislijnen"
          titel="Zes lijnen, een merk"
          tekst="UKM voert geen externe merken. Het assortiment is verdeeld in eigen lijnen, elk met een eigen techniek en prijsklasse."
          link={{ label: "Alle huislijnen", href: "/merken" }}
        />

        <OnthulGroep className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {merken.map((merk) => (
            <OnthulKind key={merk.slug}>
              <Link
                href={`/merken/${merk.slug}`}
                className="group flex h-full flex-col rounded-2xl border border-border/70 bg-white p-6 transition-all duration-500 ease-[var(--ease-uit)] hover:-translate-y-1 hover:shadow-kaart"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-lg font-semibold">{merk.naam}</h3>
                    <p className="mt-0.5 text-xs text-salie-600">{merk.positionering}</p>
                  </div>
                  <ArrowUpRight className="size-4 shrink-0 text-inkt-zacht transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-salie-700" />
                </div>

                <p className="mt-4 flex-1 text-sm leading-relaxed text-inkt-zacht">{merk.omschrijving}</p>

                <p className="mt-5 border-t border-border pt-4 text-xs text-inkt-zacht">
                  {aantallen[merk.slug] ?? 0} artikelen
                </p>
              </Link>
            </OnthulKind>
          ))}
        </OnthulGroep>
      </div>
    </section>
  );
}
