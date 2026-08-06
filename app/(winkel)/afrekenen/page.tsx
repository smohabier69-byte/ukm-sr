import type { Metadata } from "next";

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
        <AfrekenenInhoud />
      </section>
    </>
  );
}
