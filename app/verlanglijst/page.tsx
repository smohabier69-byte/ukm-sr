import type { Metadata } from "next";

import { Paginakop } from "@/components/catalogus/paginakop";
import { VerlanglijstInhoud } from "@/components/winkel/verlanglijst-inhoud";

export const metadata: Metadata = {
  title: "Verlanglijst",
  description: "De modellen die je hebt bewaard bij UKM.sr.",
  robots: { index: false, follow: true },
};

export default function Verlanglijstpagina() {
  return (
    <>
      <Paginakop
        kruimels={[{ label: "Home", href: "/" }, { label: "Verlanglijst" }]}
        titel="Verlanglijst"
        tekst="De modellen die je hebt bewaard. De lijst blijft in deze browser staan, ook als je later terugkomt."
      />

      <section className="container-ukm py-10 lg:py-14">
        <VerlanglijstInhoud />
      </section>
    </>
  );
}
