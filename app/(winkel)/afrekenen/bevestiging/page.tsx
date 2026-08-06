"use client";

import * as React from "react";
import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useWinkelwagen } from "@/lib/winkel/stores";
import { formatPrijs } from "@/lib/format";

const LAATSTE_BESTELLING_KEY = "ukm-laatste-bestelling";

interface BestellingOverzicht {
  id: string;
  status: string | undefined;
  totaal: number;
  regels: { naam: string; aantal: number; totaal: number }[];
}

export default function BevestigingPagina() {
  return (
    <section className="container-ukm py-14 lg:py-20">
      <Suspense fallback={<Skeleton className="mx-auto h-96 max-w-xl rounded-3xl" />}>
        <BevestigingInhoud />
      </Suspense>
    </section>
  );
}

function BevestigingInhoud() {
  const params = useSearchParams();
  const leegmaken = useWinkelwagen((staat) => staat.leegmaken);
  const [staat, setStaat] = React.useState<"laden" | "gevonden" | "mislukt">("laden");
  const [bestelling, setBestelling] = React.useState<BestellingOverzicht | null>(null);
  const geleegd = React.useRef(false);

  React.useEffect(() => {
    const orderId = params.get("orderId") ?? sessionStorage.getItem(LAATSTE_BESTELLING_KEY);
    if (!orderId) {
      setStaat("mislukt");
      return;
    }

    let geannuleerd = false;
    fetch(`/api/afrekenen/${orderId}`)
      .then((res) => {
        if (!res.ok) throw new Error("niet gevonden");
        return res.json();
      })
      .then((data: BestellingOverzicht) => {
        if (geannuleerd) return;
        setBestelling(data);
        setStaat("gevonden");
        sessionStorage.removeItem(LAATSTE_BESTELLING_KEY);
        // De bestelling is nu bevestigd bij Square - de winkelwagen leegmaken
        // hoort hierbij, niet al bij het versturen (dat is vóór het echte
        // afrekenen bij online betalen).
        if (!geleegd.current) {
          geleegd.current = true;
          leegmaken();
        }
      })
      .catch(() => {
        if (!geannuleerd) setStaat("mislukt");
      });
    return () => {
      geannuleerd = true;
    };
  }, [params, leegmaken]);

  if (staat === "laden") {
    return <Skeleton className="mx-auto h-96 max-w-xl rounded-3xl" />;
  }

  if (staat === "mislukt" || !bestelling) {
    return (
      <div className="mx-auto max-w-xl rounded-3xl border border-border/70 bg-white p-10 text-center">
        <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-koraal/10 text-koraal">
          <AlertCircle className="size-8" />
        </span>
        <h1 className="mt-7 font-display text-2xl font-bold">We konden je bestelling niet vinden</h1>
        <p className="mt-4 leading-relaxed text-inkt-zacht">
          Is er onderweg iets misgegaan bij het betalen? Neem contact met ons op, dan zoeken we het voor je uit.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/contact">Contact opnemen</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/producten">Verder winkelen</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="mx-auto max-w-xl rounded-3xl border border-border/70 bg-white p-10 text-center"
    >
      <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-salie-100 text-salie-700">
        <CheckCircle2 className="size-8" />
      </span>
      <h1 className="mt-7 font-display text-2xl font-bold">Bedankt voor je bestelling</h1>
      <p className="mt-4 leading-relaxed text-inkt-zacht">
        Bestelling {bestelling.id.slice(0, 8).toUpperCase()} is geplaatst. We nemen contact met je op om alles te
        bevestigen.
      </p>

      <ul className="mt-8 space-y-3 rounded-2xl bg-salie-50 p-5 text-left text-sm">
        {bestelling.regels.map((regel, i) => (
          <li key={i} className="flex items-center justify-between gap-4">
            <span className="text-inkt-zacht">
              {regel.aantal}&times; {regel.naam}
            </span>
            <span className="font-medium">{formatPrijs(regel.totaal)}</span>
          </li>
        ))}
        <li className="flex items-center justify-between gap-4 border-t border-salie-200 pt-3 font-display font-semibold">
          <span>Totaal</span>
          <span>{formatPrijs(bestelling.totaal)}</span>
        </li>
      </ul>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild size="lg">
          <Link href="/account/bestellingen">Mijn bestellingen</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/producten">Verder winkelen</Link>
        </Button>
      </div>
    </motion.div>
  );
}
