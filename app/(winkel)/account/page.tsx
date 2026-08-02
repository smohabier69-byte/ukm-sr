import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, MessageCircle, PackageSearch, UserRound } from "lucide-react";

import { Paginakop } from "@/components/catalogus/paginakop";
import { AccountOverzicht } from "@/components/account/account-overzicht";
import { RecentBekeken } from "@/components/product/recent-bekeken";
import { Button } from "@/components/ui/button";
import { auth } from "@/auth";
import { meldAf } from "@/app/(winkel)/account/acties";
import { bedrijf, whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Mijn account",
  description: "Log in om je bestellingen, adressen en verlanglijst bij UKM.sr te beheren.",
  robots: { index: false, follow: true },
};

export default async function AccountPagina() {
  const sessie = await auth();

  return (
    <>
      <Paginakop
        kruimels={[{ label: "Home", href: "/" }, { label: "Mijn account" }]}
        titel="Mijn account"
        tekst={sessie?.user ? `Welkom terug, ${sessie.user.name ?? sessie.user.email}.` : "Log in of maak een account aan."}
      />

      <section className="container-ukm py-10 lg:py-14">
        {sessie?.user ? (
          <>
            <div className="grid gap-4 sm:grid-cols-3">
              <KaartLink
                icoon={<PackageSearch className="size-5" />}
                titel="Bestellingen"
                tekst="Bekijk je bestelgeschiedenis"
                href="/account/bestellingen"
              />
              <KaartLink
                icoon={<MapPin className="size-5" />}
                titel="Adressen"
                tekst="Beheer je opgeslagen adressen"
                href="/account/adressen"
              />
              <KaartLink
                icoon={<UserRound className="size-5" />}
                titel="Gegevens en privacy"
                tekst="Lees het privacybeleid"
                href="/privacybeleid"
              />
            </div>

            <div className="mt-10">
              <AccountOverzicht />
            </div>

            <form action={meldAf} className="mt-8">
              <Button type="submit" variant="outline" size="sm">
                Uitloggen
              </Button>
            </form>
          </>
        ) : (
          <>
            <div className="mb-10 flex flex-col items-start gap-4 rounded-3xl border border-border/70 bg-white p-7 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-display text-lg font-semibold">Nog niet ingelogd</h2>
                <p className="mt-1 text-sm leading-relaxed text-inkt-zacht">
                  Log in om je bestellingen te volgen, adressen op te slaan en sneller af te rekenen.
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-3">
                <Button asChild variant="outline">
                  <Link href="/account/registreren">Account aanmaken</Link>
                </Button>
                <Button asChild>
                  <Link href="/account/inloggen">Inloggen</Link>
                </Button>
              </div>
            </div>

            <AccountOverzicht />

            <div className="mt-10 grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-border/70 bg-white p-6">
                <h2 className="font-display text-lg font-semibold">Bestellingen</h2>
                <p className="mt-2 text-sm leading-relaxed text-inkt-zacht">
                  Bestellingen lopen op dit moment via WhatsApp of in de winkel. Vraag naar de stand van je
                  bestelling met je bestelnummer bij de hand, dan zoeken we het meteen op.
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
                  Deze website plaatst geen volgcookies en stuurt niets door naar derden. Wat er wel wordt
                  opgeslagen, staat beschreven in het privacybeleid.
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
          </>
        )}

        <p className="mt-10 text-sm text-inkt-zacht">
          Liever persoonlijk geholpen? Kom langs aan de {bedrijf.adres.straat} in {bedrijf.adres.stad}.
        </p>
      </section>

      <RecentBekeken />
    </>
  );
}

function KaartLink({
  icoon,
  titel,
  tekst,
  href,
}: {
  icoon: React.ReactNode;
  titel: string;
  tekst: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col rounded-2xl border border-border/70 bg-white p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-kaart"
    >
      <span className="flex size-11 items-center justify-center rounded-full bg-salie-100 text-salie-700">
        {icoon}
      </span>
      <p className="mt-4 font-display font-semibold">{titel}</p>
      <p className="mt-1 text-sm text-inkt-zacht">{tekst}</p>
    </Link>
  );
}
