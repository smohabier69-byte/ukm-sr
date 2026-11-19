"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { AlertCircle, ArrowRight, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { WhatsAppIcoon } from "@/components/merk/sociale-iconen";
import { formatPrijs } from "@/lib/format";
import { bedrijf, whatsappLink } from "@/lib/site";
import type { GeplaatsteBestelling } from "@/lib/winkel/bestelling.server";

const LAATSTE_BESTELLING_KEY = "ukm-laatste-bestelling";

/**
 * Laatste stap van een bestelling: het WhatsApp-bericht met de hele
 * bestelling versturen naar het zakelijke nummer van UKM. Pas dan is de
 * bestelling binnen, dus deze pagina zegt dat ook letterlijk.
 */
export default function BevestigingPagina() {
  const [staat, setStaat] = React.useState<"laden" | "gevonden" | "leeg">("laden");
  const [bestelling, setBestelling] = React.useState<GeplaatsteBestelling | null>(null);

  React.useEffect(() => {
    try {
      const opgeslagen = sessionStorage.getItem(LAATSTE_BESTELLING_KEY);
      if (opgeslagen) {
        setBestelling(JSON.parse(opgeslagen) as GeplaatsteBestelling);
        setStaat("gevonden");
        return;
      }
    } catch {
      // sessionStorage kan geblokkeerd zijn; dan valt de pagina terug op "leeg".
    }
    setStaat("leeg");
  }, []);

  return (
    <section className="container-ukm py-14 lg:py-20">
      {staat === "laden" ? (
        <Skeleton className="mx-auto h-96 max-w-xl rounded-3xl" />
      ) : staat === "leeg" || !bestelling ? (
        <GeenBestelling />
      ) : (
        <Bevestiging bestelling={bestelling} />
      )}
    </section>
  );
}

function Bevestiging({ bestelling }: { bestelling: GeplaatsteBestelling }) {
  const { kosten } = bestelling;
  const bezorgen = bestelling.bezorgwijze === "bezorgen";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="mx-auto max-w-xl rounded-3xl border border-border/70 bg-white p-8 text-center sm:p-10"
    >
      {bestelling.automatisch ? (
        <>
          {/* De WhatsApp-bot stuurt de bestelling zelf door; de klant hoeft niets meer te doen. */}
          <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-salie-100 text-salie-700">
            <CheckCircle2 className="size-8" />
          </span>
          <p className="mt-6 text-salie-600 bovenschrift">Bestelnummer {bestelling.bestelnummer}</p>
          <h1 className="mt-2 font-display text-2xl font-bold sm:text-3xl">Nog één stap: bevestig via WhatsApp</h1>
          <p className="mt-4 leading-relaxed text-inkt-zacht">
            Je ontvangt via WhatsApp de catalogusfoto’s en het overzicht van je gekozen artikelen.
            Controleer deze en antwoord ja als alles klopt. Daarna ontvangt UKM je bevestigde aanvraag en
            bespreken we {bezorgen ? "de bezorgkosten en de levering" : "het afhalen"}.
            Geen WhatsApp ontvangen? App ons met je bestelnummer.
          </p>
          <Button asChild size="lg" variant="outline" className="mt-7">
            <a href={bestelling.whatsappUrl} target="_blank" rel="noreferrer noopener">
              <WhatsAppIcoon className="size-5" />
              Vraag over je bestelling? App ons
            </a>
          </Button>
        </>
      ) : (
        <>
          <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-[#25d366]/12 text-[#1da851]">
            <WhatsAppIcoon className="size-8" />
          </span>
          <p className="mt-6 text-salie-600 bovenschrift">Bestelnummer {bestelling.bestelnummer}</p>
          <h1 className="mt-2 font-display text-2xl font-bold sm:text-3xl">
            Nog één stap: stuur je bestelling via WhatsApp
          </h1>
          <p className="mt-4 leading-relaxed text-inkt-zacht">
            Je bestelling staat klaar in een WhatsApp-bericht aan {bedrijf.naam} ({bedrijf.telefoon}). Druk op
            versturen, dan is ze bij ons binnen. We bevestigen {bezorgen ? "de bezorgkosten en " : ""}alles via
            WhatsApp.
          </p>
          <Button asChild size="lg" className="mt-7 w-full bg-[#25d366] text-white hover:bg-[#1fbd5a] sm:w-auto">
            <a href={bestelling.whatsappUrl} target="_blank" rel="noreferrer noopener">
              <WhatsAppIcoon className="size-5" />
              Verstuur bestelling via WhatsApp
            </a>
          </Button>
        </>
      )}

      <ul className="mt-8 space-y-3 rounded-2xl bg-salie-50 p-5 text-left text-sm">
        {bestelling.regels.map((regel, i) => (
          <li key={i} className="flex items-start justify-between gap-4">
            <span className="text-inkt-zacht">
              {regel.aantal}&times; {regel.naam}
              {regel.uitvoering ? <span className="block text-xs">{regel.uitvoering}</span> : null}
            </span>
            <span className="shrink-0 font-medium">{formatPrijs(regel.totaal)}</span>
          </li>
        ))}
        {kosten.korting > 0 ? (
          <li className="flex justify-between gap-4 text-salie-700">
            <span>Korting</span>
            <span>-{formatPrijs(kosten.korting)}</span>
          </li>
        ) : null}
        <li className="flex justify-between gap-4">
          <span className="text-inkt-zacht">Bezorging</span>
          <span className="text-right font-medium">
            {bezorgen ? (
              <>
                vanaf {formatPrijs(kosten.bezorgkosten)}
                <span className="block text-xs font-normal text-inkt-zacht">
                  + {formatPrijs(bedrijf.bezorgingPerKm)} per extra km
                </span>
              </>
            ) : (
              "Afhalen, gratis"
            )}
          </span>
        </li>
        <li className="flex items-center justify-between gap-4 border-t border-salie-200 pt-3 font-display font-semibold">
          <span>Totaal</span>
          <span>
            {bezorgen ? <span className="mr-1 font-sans text-xs font-normal text-inkt-zacht">vanaf</span> : null}
            {formatPrijs(kosten.totaal)}
          </span>
        </li>
      </ul>

      <Button asChild size="lg" variant="outline" className="mt-7">
        <Link href="/producten">
          Verder winkelen
          <ArrowRight />
        </Link>
      </Button>
    </motion.div>
  );
}

function GeenBestelling() {
  return (
    <div className="mx-auto max-w-xl rounded-3xl border border-border/70 bg-white p-10 text-center">
      <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-koraal/10 text-koraal">
        <AlertCircle className="size-8" />
      </span>
      <h1 className="mt-7 font-display text-2xl font-bold">Geen openstaande bestelling gevonden</h1>
      <p className="mt-4 leading-relaxed text-inkt-zacht">
        Heb je net besteld maar zie je hier niets? Stuur ons gerust een bericht, dan zoeken we het samen uit.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild size="lg">
          <a href={whatsappLink("Hallo UKM.sr, ik heb een vraag over mijn bestelling.")} target="_blank" rel="noreferrer noopener">
            <WhatsAppIcoon className="size-5" />
            WhatsApp ons
          </a>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/producten">Verder winkelen</Link>
        </Button>
      </div>
    </div>
  );
}
