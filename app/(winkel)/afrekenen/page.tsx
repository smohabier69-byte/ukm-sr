import type { Metadata } from "next";
import { Info } from "lucide-react";

import { Paginakop } from "@/components/catalogus/paginakop";
import { AfrekenenInhoud } from "@/components/winkel/afrekenen-inhoud";

export const metadata: Metadata = {
  title: "Afrekenen",
  description: "Rond je bestelling af bij UKM.sr.",
  robots: { index: false, follow: false },
};

export default function Afrekenpagina() {
  return (
    <>
      <Paginakop
        kruimels={[
          { label: "Home", href: "/" },
          { label: "Winkelwagen", href: "/winkelwagen" },
          { label: "Afrekenen" },
        ]}
        titel="Afrekenen"
      />

      <section className="container-ukm py-10 lg:py-14">
        {/*
          De opdracht vraagt om deze mededeling op de afrekenpagina. Hij staat
          bewust boven het formulier en niet in de voettekst, zodat niemand
          echte gegevens invult in de veronderstelling te bestellen.
        */}
        <div className="mb-10 flex items-start gap-3 rounded-2xl border border-goud/30 bg-goud/8 px-5 py-4">
          <Info className="mt-0.5 size-5 shrink-0 text-goud" />
          <div>
            <p className="font-display font-semibold">Deze website is een demonstratie, gemaakt voor UKM.</p>
            <p className="mt-1 text-sm leading-relaxed text-inkt-zacht">
              Er worden geen bestellingen verwerkt, geen betalingen gedaan en geen gegevens opgeslagen. Vul hieronder
              gerust iets in om te zien hoe het werkt, maar gebruik geen echte persoonsgegevens.
            </p>
          </div>
        </div>

        <AfrekenenInhoud />
      </section>
    </>
  );
}
