import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Home, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { hoofdcategorieen } from "@/data/categorieen";

export const metadata: Metadata = {
  title: "Pagina niet gevonden",
  description: "Deze pagina bestaat niet of is verplaatst.",
  robots: { index: false, follow: true },
};

export default function NietGevonden() {
  return (
    <section className="container-ukm flex min-h-[70vh] flex-col items-center justify-center py-20 text-center">
      <p className="font-display text-[6rem] leading-none font-extrabold text-salie-200 sm:text-[9rem]">404</p>

      <h1 className="mt-2 font-display text-3xl font-bold sm:text-4xl">Deze pagina konden we niet vinden</h1>
      <p className="mt-4 max-w-md leading-relaxed text-inkt-zacht">
        Mogelijk is het model uit de collectie gehaald of klopt het adres niet helemaal. Hieronder komt u snel weer
        op weg.
      </p>

      <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
        <Button asChild size="lg">
          <Link href="/">
            <Home />
            Naar de homepagina
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/producten">
            <Search />
            Bekijk het assortiment
          </Link>
        </Button>
      </div>

      <div className="mt-14 grid w-full max-w-2xl gap-4 sm:grid-cols-2">
        {hoofdcategorieen.map((categorie) => (
          <Link
            key={categorie.slug}
            href={`/categorie/${categorie.slug}`}
            className="group rounded-2xl border border-border/70 bg-white p-6 text-left transition-all duration-500 ease-[var(--ease-uit)] hover:-translate-y-1 hover:shadow-kaart"
          >
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
              {categorie.naam}
              <ArrowLeft className="size-4 rotate-180 text-inkt-zacht transition-transform duration-300 group-hover:translate-x-1" />
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-inkt-zacht">{categorie.omschrijving}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
