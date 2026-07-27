import type { Metadata } from "next";

import { Paginakop } from "@/components/catalogus/paginakop";
import { WinkelwagenInhoud } from "@/components/winkel/winkelwagen-inhoud";
import { RecentBekeken } from "@/components/product/recent-bekeken";

export const metadata: Metadata = {
  title: "Winkelwagen",
  description: "Bekijk en wijzig de artikelen in je winkelwagen bij UKM.sr.",
  robots: { index: false, follow: true },
};

export default function Winkelwagenpagina() {
  return (
    <>
      <Paginakop
        kruimels={[{ label: "Home", href: "/" }, { label: "Winkelwagen" }]}
        titel="Winkelwagen"
        tekst="Controleer je bestelling en pas aantallen aan voordat je afrekent."
      />

      <section className="container-ukm py-10 lg:py-14">
        <WinkelwagenInhoud />
      </section>

      <RecentBekeken titel="Misschien ook interessant" />
    </>
  );
}
