import Link from "next/link";
import { Plus } from "lucide-react";

import { OnthulGroep, OnthulKind } from "@/components/motion/onthul";
import { Sectiekop } from "@/components/home/sectiekop";
import { vraaggroepen } from "@/data/veelgestelde-vragen";

/**
 * Een vraag per onderwerp, in plaats van de eerste zes van dezelfde groep,
 * zodat de preview de breedte van de echte pagina laat zien.
 */
export function VeelgesteldeVragenPreview() {
  const selectie = vraaggroepen.map((groep) => ({ groep, vraag: groep.vragen[0] }));

  return (
    <section className="container-ukm py-14 lg:py-20">
      <Sectiekop
        bovenschrift="Vragen"
        titel="Veelgestelde vragen"
        tekst="Bezorging, sterktes, hygiëne en betalen: het meeste is al eens gevraagd."
        link={{ label: "Alle vragen bekijken", href: "/veelgestelde-vragen" }}
      />

      <OnthulGroep className="grid gap-x-8 gap-y-1 sm:grid-cols-2">
        {selectie.map(({ groep, vraag }) => (
          <OnthulKind key={groep.id}>
            <Link
              href={`/veelgestelde-vragen#${groep.id}`}
              className="group flex items-start justify-between gap-4 border-b border-border/70 py-5 transition-colors hover:border-salie-300"
            >
              <span>
                <span className="block text-[0.6875rem] font-semibold tracking-[0.1em] text-salie-600 uppercase">
                  {groep.titel}
                </span>
                <span className="mt-1 block font-display text-base font-semibold text-inkt">{vraag.vraag}</span>
              </span>
              <Plus className="mt-1 size-4 shrink-0 text-inkt-zacht transition-transform duration-300 ease-[var(--ease-uit)] group-hover:rotate-45 group-hover:text-salie-700" />
            </Link>
          </OnthulKind>
        ))}
      </OnthulGroep>
    </section>
  );
}
