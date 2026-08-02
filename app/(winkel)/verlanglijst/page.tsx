import type { Metadata } from "next";

import { Paginakop } from "@/components/catalogus/paginakop";
import { VerlanglijstInhoud } from "@/components/winkel/verlanglijst-inhoud";
import { auth } from "@/auth";

export const metadata: Metadata = {
  title: "Verlanglijst",
  description: "De modellen die je hebt bewaard bij UKM.sr.",
  robots: { index: false, follow: true },
};

export default async function Verlanglijstpagina() {
  const sessie = await auth();

  return (
    <>
      <Paginakop
        kruimels={[{ label: "Home", href: "/" }, { label: "Verlanglijst" }]}
        titel="Verlanglijst"
        tekst={
          sessie?.user
            ? "De modellen die je hebt bewaard, gekoppeld aan je account - ook terug te vinden op een ander apparaat."
            : "De modellen die je hebt bewaard. De lijst blijft in deze browser staan, tenzij je inlogt."
        }
      />

      <section className="container-ukm py-10 lg:py-14">
        <VerlanglijstInhoud />
      </section>
    </>
  );
}
