import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { OnthulGroep, OnthulKind } from "@/components/motion/onthul";
import { Sectiekop } from "@/components/home/sectiekop";
import { categorieen } from "@/data/categorieen";
import { aantalPerCategorie } from "@/data/producten";

export function CategorieenSectie() {
  const aantallen = aantalPerCategorie();

  return (
    <section className="container-ukm py-14 lg:py-20">
      <Sectiekop
        bovenschrift="Populaire categorieen"
        titel="Waar bent u naar op zoek?"
        tekst="Het assortiment is ingedeeld zoals in de winkel: eerst de techniek, dan de vorm en de kleur."
        link={{ label: "Alle producten", href: "/producten" }}
      />

      <OnthulGroep className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {categorieen.map((categorie, i) => (
          <OnthulKind key={categorie.slug} className={i === 0 ? "sm:col-span-2 lg:col-span-1 lg:row-span-2" : ""}>
            <Link
              href={`/categorie/${categorie.slug}`}
              className="group relative flex h-full min-h-56 flex-col justify-end overflow-hidden rounded-3xl bg-creme-diep p-6 shadow-zacht transition-shadow duration-500 hover:shadow-kaart lg:min-h-64"
            >
              <Image
                src={categorie.afbeelding}
                alt=""
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover object-top transition-transform duration-700 ease-[var(--ease-uit)] group-hover:scale-105"
              />
              <div className="absolute inset-0 overlay-onder" />

              <div className="relative text-white">
                <p className="text-[0.6875rem] font-semibold tracking-[0.14em] uppercase opacity-80">
                  {aantallen[categorie.slug] ?? 0} artikelen
                </p>
                <h3 className="mt-1.5 flex items-center gap-2 font-display text-xl font-semibold">
                  {categorie.naam}
                  <ArrowUpRight className="size-4 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
                </h3>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/85">{categorie.omschrijving}</p>
              </div>
            </Link>
          </OnthulKind>
        ))}
      </OnthulGroep>
    </section>
  );
}
