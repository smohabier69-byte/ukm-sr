import type { Metadata } from "next";
import Link from "next/link";
import { Info, MessageCircle } from "lucide-react";

import { Paginakop } from "@/components/catalogus/paginakop";
import { AccountOverzicht } from "@/components/account/account-overzicht";
import { RecentBekeken } from "@/components/product/recent-bekeken";
import { Button } from "@/components/ui/button";
import { bedrijf, whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Mijn account",
  description: "Je verlanglijst, winkelwagen en recent bekeken artikelen bij UKM.sr.",
  robots: { index: false, follow: true },
};

export default function AccountPagina() {
  return (
    <>
      <Paginakop
        kruimels={[{ label: "Home", href: "/" }, { label: "Mijn account" }]}
        titel="Mijn account"
        tekst="Wat je bewaart en bekijkt, houden we bij in deze browser."
      />

      <section className="container-ukm py-10 lg:py-14">
        {/*
          Bewust geen inlogformulier. Zonder werkende achterkant zou een veld
          voor wachtwoorden alleen maar de indruk wekken dat er een account
          bestaat, en zou iemand er echte inloggegevens in kunnen typen.
        */}
        <div className="mb-10 flex items-start gap-3 rounded-2xl border border-goud/30 bg-goud/8 px-5 py-4">
          <Info className="mt-0.5 size-5 shrink-0 text-goud" />
          <div>
            <p className="font-display font-semibold">Aanmelden is in deze demonstratie niet actief.</p>
            <p className="mt-1 text-sm leading-relaxed text-inkt-zacht">
              Er is geen account aan te maken en er worden geen inloggegevens gevraagd of bewaard. Je verlanglijst en
              winkelwagen staan alleen in deze browser opgeslagen, niet op een server.
            </p>
          </div>
        </div>

        <AccountOverzicht />

        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-border/70 bg-white p-6">
            <h2 className="font-display text-lg font-semibold">Bestellingen</h2>
            <p className="mt-2 text-sm leading-relaxed text-inkt-zacht">
              Bestellingen lopen op dit moment via WhatsApp of in de winkel. Vraag naar de stand van je bestelling met
              je bestelnummer bij de hand, dan zoeken we het meteen op.
            </p>
            <Button asChild variant="outline" size="sm" className="mt-5">
              <a
                href={whatsappLink("Goedendag, ik wil graag de status van mijn bestelling weten.")}
                target="_blank"
                rel="noreferrer noopener"
              >
                <MessageCircle />
                Vraag naar je bestelling
              </a>
            </Button>
          </div>

          <div className="rounded-2xl border border-border/70 bg-white p-6">
            <h2 className="font-display text-lg font-semibold">Gegevens en privacy</h2>
            <p className="mt-2 text-sm leading-relaxed text-inkt-zacht">
              Deze website plaatst geen volgcookies en stuurt niets door naar derden. Wat er wel wordt opgeslagen,
              staat beschreven in het privacybeleid.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button asChild variant="outline" size="sm">
                <Link href="/privacybeleid">Privacybeleid</Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link href="/contact">Contact opnemen</Link>
              </Button>
            </div>
          </div>
        </div>

        <p className="mt-10 text-sm text-inkt-zacht">
          Liever persoonlijk geholpen? Kom langs aan de {bedrijf.adres.straat} in {bedrijf.adres.stad}.
        </p>
      </section>

      <RecentBekeken />
    </>
  );
}
