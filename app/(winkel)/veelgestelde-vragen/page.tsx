import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircle } from "lucide-react";

import { Paginakop } from "@/components/catalogus/paginakop";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Onthul } from "@/components/motion/onthul";
import { alleVragen, vraaggroepen } from "@/data/veelgestelde-vragen";
import { bedrijf, whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Veelgestelde vragen",
  description:
    "Antwoorden op vragen over bezorging, sterkte, anti-blauwlicht, PTC, lenzenhygiene, houdbaarheid en betalen bij UKM.sr.",
  alternates: { canonical: "/veelgestelde-vragen" },
};

/** Gestructureerde gegevens zodat de vragen in Google kunnen uitklappen. */
const vraagSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: alleVragen.map((vraag) => ({
    "@type": "Question",
    name: vraag.vraag,
    acceptedAnswer: { "@type": "Answer", text: vraag.antwoord },
  })),
};

export default function VeelgesteldeVragenPagina() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(vraagSchema) }} />

      <Paginakop
        kruimels={[{ label: "Home", href: "/" }, { label: "Veelgestelde vragen" }]}
        titel="Veelgestelde vragen"
        tekst="Staat uw vraag er niet bij? Stuur gerust een bericht, we helpen graag."
      />

      <section className="container-ukm grid gap-12 py-10 lg:grid-cols-[16rem_1fr] lg:gap-16 lg:py-14">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <p className="mb-4 font-display text-[0.6875rem] font-semibold tracking-[0.14em] text-inkt-zacht uppercase">
            Onderwerpen
          </p>
          <nav aria-label="Onderwerpen">
            <ul className="space-y-1">
              {vraaggroepen.map((groep) => (
                <li key={groep.id}>
                  <a
                    href={`#${groep.id}`}
                    className="block rounded-xl px-3 py-2 text-sm text-inkt-zacht transition-colors hover:bg-salie-50 hover:text-salie-700"
                  >
                    {groep.titel}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-8 rounded-2xl bg-salie-50 p-5">
            <MessageCircle className="size-5 text-salie-700" />
            <p className="mt-3 font-display text-sm font-semibold">Liever even overleggen?</p>
            <p className="mt-1.5 text-xs leading-relaxed text-inkt-zacht">
              We reageren tijdens openingstijden meestal binnen een uur.
            </p>
            <Button asChild size="sm" className="mt-4 w-full">
              <a
                href={whatsappLink("Goedendag, ik heb een vraag.")}
                target="_blank"
                rel="noreferrer noopener"
              >
                WhatsApp ons
              </a>
            </Button>
          </div>
        </aside>

        <div className="min-w-0">
          {vraaggroepen.map((groep) => (
            <Onthul key={groep.id} id={groep.id} className="mb-12 scroll-mt-28 last:mb-0">
              <h2 className="mb-2 font-display text-2xl font-bold">{groep.titel}</h2>
              <Accordion type="multiple" defaultValue={[`${groep.id}-0`]}>
                {groep.vragen.map((vraag, i) => (
                  <AccordionItem key={vraag.vraag} value={`${groep.id}-${i}`}>
                    <AccordionTrigger>{vraag.vraag}</AccordionTrigger>
                    <AccordionContent>{vraag.antwoord}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </Onthul>
          ))}

          <div className="mt-14 rounded-3xl bg-creme-diep p-8 text-center sm:p-10">
            <h2 className="font-display text-xl font-semibold">Vraag er niet bij?</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-inkt-zacht">
              Bel {bedrijf.telefoon}, stuur een bericht via WhatsApp of kom langs aan de {bedrijf.adres.straat}.
            </p>
            <Button asChild className="mt-6">
              <Link href="/contact">Naar de contactpagina</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
