import type { Metadata } from "next";

import { Paginakop } from "@/components/catalogus/paginakop";
import { WachtwoordVergetenFormulier } from "@/components/account/wachtwoord-vergeten-formulier";

export const metadata: Metadata = {
  title: "Wachtwoord vergeten",
  robots: { index: false, follow: true },
};

export default function WachtwoordVergetenPagina() {
  return (
    <>
      <Paginakop
        kruimels={[
          { label: "Home", href: "/" },
          { label: "Mijn account", href: "/account" },
          { label: "Wachtwoord vergeten" },
        ]}
        titel="Wachtwoord vergeten"
        tekst="Vul je e-mailadres in, dan sturen we een link om een nieuw wachtwoord in te stellen."
      />

      <section className="container-ukm py-10 lg:py-14">
        <div className="mx-auto max-w-sm">
          <WachtwoordVergetenFormulier />
        </div>
      </section>
    </>
  );
}
