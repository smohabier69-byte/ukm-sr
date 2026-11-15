import { Banknote, MessageCircle, ShoppingBag, Truck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { OnthulGroep, OnthulKind } from "@/components/motion/onthul";
import { Sectiekop } from "@/components/home/sectiekop";
import { formatPrijs } from "@/lib/format";
import { bedrijf, whatsappLink } from "@/lib/site";

const stappen = [
  {
    icoon: ShoppingBag,
    titel: "Kies je favoriet",
    tekst: "Bestel hier in de webwinkel, of stuur ons een appje met het model dat je wilt.",
  },
  {
    icoon: Truck,
    titel: "Bezorgd of afhalen",
    tekst: `Wij bezorgen tot aan huis in ${bedrijf.adres.stad}, vanaf ${formatPrijs(bedrijf.bezorgingVanaf)}. Afhalen kan aan de ${bedrijf.adres.straat}.`,
  },
  {
    icoon: Banknote,
    titel: "Betaal zoals je wilt",
    tekst: "Contant, per bankoverschrijving of met pin.",
  },
];

/** Hoe bestellen werkt, in drie stappen, met de WhatsApp-ingang die de prijslijsten ook noemen. */
export function ZoBestelJe() {
  return (
    <section className="container-ukm py-14 lg:py-20">
      <div className="rounded-[2rem] border border-border/70 bg-white p-8 sm:p-12 lg:p-14">
        <Sectiekop
          gecentreerd
          bovenschrift="Zo werkt het"
          titel={
            <>
              Bestellen is <em>zo geregeld</em>
            </>
          }
        />

        <OnthulGroep className="grid gap-8 sm:grid-cols-3 sm:gap-6">
          {stappen.map((stap, i) => (
            <OnthulKind key={stap.titel} className="text-center">
              <span className="relative mx-auto flex size-16 items-center justify-center rounded-full bg-salie-100 text-salie-700">
                <stap.icoon className="size-6" />
                <span className="absolute -top-1 -right-1 flex size-6 items-center justify-center rounded-full bg-inkt text-[0.6875rem] font-semibold text-creme">
                  {i + 1}
                </span>
              </span>
              <h3 className="mt-5 font-display text-xl font-semibold">{stap.titel}</h3>
              <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-inkt-zacht">{stap.tekst}</p>
            </OnthulKind>
          ))}
        </OnthulGroep>

        <div className="mt-11 flex flex-col items-center gap-3 border-t border-border/70 pt-9 sm:flex-row sm:justify-center sm:gap-5">
          <Button asChild size="lg">
            <a
              href={whatsappLink("Hallo UKM.sr, ik wil graag iets bestellen.")}
              target="_blank"
              rel="noreferrer noopener"
            >
              <MessageCircle />
              Bestel via WhatsApp
            </a>
          </Button>
          <p className="text-center text-sm text-inkt-zacht sm:text-left">
            {bedrijf.telefoon} &middot; {bedrijf.openingstijden[0].dagen.toLowerCase()} {bedrijf.openingstijden[0].tijden}
          </p>
        </div>
      </div>
    </section>
  );
}
