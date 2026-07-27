import type { Metadata } from "next";
import { Clock, Info, Mail, MapPin, MessageCircle, Phone } from "lucide-react";

import { Paginakop } from "@/components/catalogus/paginakop";
import { Contactformulier } from "@/components/contact/contactformulier";
import { Button } from "@/components/ui/button";
import { Onthul } from "@/components/motion/onthul";
import { FacebookIcoon, InstagramIcoon } from "@/components/merk/sociale-iconen";
import { bedrijf, whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: `Bereik UKM.sr via WhatsApp op ${bedrijf.telefoon} of kom langs aan de ${bedrijf.adres.straat} in ${bedrijf.adres.stad}.`,
  alternates: { canonical: "/contact" },
};

export default function ContactPagina() {
  return (
    <>
      <Paginakop
        kruimels={[{ label: "Home", href: "/" }, { label: "Contact" }]}
        titel="Contact"
        tekst="Een vraag over een montuur, een sterkte of een bestelling? Stuur een bericht of kom langs in de winkel."
      />

      <section className="container-ukm grid gap-12 py-10 lg:grid-cols-[1fr_1.2fr] lg:gap-16 lg:py-14">
        <Onthul>
          <h2 className="font-display text-2xl font-bold">Direct contact</h2>

          <ul className="mt-7 space-y-6">
            <li className="flex gap-4">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-salie-100 text-salie-700">
                <MessageCircle className="size-5" />
              </span>
              <div>
                <p className="font-display font-semibold">WhatsApp</p>
                <p className="mt-1 text-sm leading-relaxed text-inkt-zacht">
                  De snelste manier. We reageren tijdens openingstijden meestal binnen een uur.
                </p>
                <Button asChild size="sm" className="mt-3">
                  <a
                    href={whatsappLink("Goedendag, ik heb een vraag over een product op de website.")}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    Stuur een bericht
                  </a>
                </Button>
              </div>
            </li>

            <li className="flex gap-4">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-salie-100 text-salie-700">
                <Phone className="size-5" />
              </span>
              <div>
                <p className="font-display font-semibold">Telefoon</p>
                <a
                  href={`tel:${bedrijf.telefoonPlat}`}
                  className="mt-1 block text-sm text-inkt-zacht transition-colors hover:text-salie-700"
                >
                  {bedrijf.telefoon}
                </a>
              </div>
            </li>

            <li className="flex gap-4">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-salie-100 text-salie-700">
                <Mail className="size-5" />
              </span>
              <div>
                <p className="font-display font-semibold">E-mail</p>
                <a
                  href={`mailto:${bedrijf.email}`}
                  className="mt-1 block text-sm text-inkt-zacht transition-colors hover:text-salie-700"
                >
                  {bedrijf.email}
                </a>
              </div>
            </li>

            <li id="winkel" className="flex scroll-mt-28 gap-4">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-salie-100 text-salie-700">
                <MapPin className="size-5" />
              </span>
              <div>
                <p className="font-display font-semibold">De winkel</p>
                <p className="mt-1 text-sm leading-relaxed text-inkt-zacht">
                  {bedrijf.adres.straat}
                  <br />
                  {bedrijf.adres.stad}, {bedrijf.adres.land}
                </p>
                <p className="mt-2 text-sm text-inkt-zacht">Vlak bij Republic Bank, hoek Amethistraat.</p>
              </div>
            </li>

            <li className="flex gap-4">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-salie-100 text-salie-700">
                <Clock className="size-5" />
              </span>
              <div>
                <p className="font-display font-semibold">Openingstijden</p>
                <dl className="mt-2 space-y-1 text-sm">
                  {bedrijf.openingstijden.map((rij) => (
                    <div key={rij.dagen} className="flex gap-3">
                      <dt className="w-44 shrink-0 text-inkt-zacht">{rij.dagen}</dt>
                      <dd className="font-medium tabular-nums">{rij.tijden}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </li>
          </ul>

          <div className="mt-8 flex gap-2">
            <a
              href={bedrijf.instagramUrl}
              target="_blank"
              rel="noreferrer noopener"
              aria-label="UKM.sr op Instagram"
              className="rounded-full border border-border bg-white p-2.5 text-inkt-zacht transition-colors hover:border-salie-400 hover:text-salie-700"
            >
              <InstagramIcoon className="size-4" />
            </a>
            <a
              href={bedrijf.facebookUrl}
              target="_blank"
              rel="noreferrer noopener"
              aria-label="UKM.sr op Facebook"
              className="rounded-full border border-border bg-white p-2.5 text-inkt-zacht transition-colors hover:border-salie-400 hover:text-salie-700"
            >
              <FacebookIcoon className="size-4" />
            </a>
          </div>
        </Onthul>

        <Onthul richting="links" vertraging={0.08}>
          <div className="rounded-3xl border border-border/70 bg-white p-7 sm:p-9">
            <h2 className="font-display text-2xl font-bold">Stuur een bericht</h2>
            <p className="mt-2 text-sm leading-relaxed text-inkt-zacht">
              Laat uw vraag achter, dan nemen we contact op.
            </p>

            <div className="mt-6 flex items-start gap-2.5 rounded-2xl bg-creme-diep p-4">
              <Info className="mt-0.5 size-4 shrink-0 text-inkt-zacht" />
              <p className="text-xs leading-relaxed text-inkt-zacht">
                Deze website is een demonstratie. Het formulier verstuurt niets en slaat niets op. Gebruik WhatsApp of
                telefoon om UKM werkelijk te bereiken.
              </p>
            </div>

            <Contactformulier />
          </div>
        </Onthul>
      </section>
    </>
  );
}
