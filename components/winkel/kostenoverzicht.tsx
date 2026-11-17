"use client";

import * as React from "react";
import { Check, TicketPercent, Truck, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWinkelwagen } from "@/lib/winkel/stores";
import { kortingscodes, zoekKortingscode, type Kostenoverzicht as Kosten } from "@/lib/winkel/prijzen";
import { formatPrijs } from "@/lib/format";
import { bedrijf } from "@/lib/site";

/** Kortingscodeveld met directe terugkoppeling over waarom een code wel of niet geldt. */
export function Kortingscodeveld({ subtotaal }: { subtotaal: number }) {
  const kortingscode = useWinkelwagen((staat) => staat.kortingscode);
  const zetKortingscode = useWinkelwagen((staat) => staat.zetKortingscode);
  const [invoer, setInvoer] = React.useState("");

  const toepassen = (e: React.FormEvent) => {
    e.preventDefault();
    const code = zoekKortingscode(invoer);

    if (!code) {
      toast.error("Onbekende kortingscode", { description: `"${invoer.trim()}" is niet geldig.` });
      return;
    }
    if (subtotaal < (code.vanaf ?? 0)) {
      toast.error("Code nog niet geldig", {
        description: `${code.code} geldt vanaf ${formatPrijs(code.vanaf ?? 0)}.`,
      });
      return;
    }

    zetKortingscode(code.code);
    setInvoer("");
    toast.success("Kortingscode toegepast", { description: code.omschrijving });
  };

  const actief = kortingscode ? zoekKortingscode(kortingscode) : undefined;

  // Zonder lopende acties geen invoerveld: een veld dat altijd "ongeldig" zegt, frustreert alleen.
  if (kortingscodes.length === 0) return null;

  if (actief) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-2xl bg-salie-100 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <Check className="size-4 shrink-0 text-salie-700" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-salie-800">{actief.code}</p>
            <p className="truncate text-xs text-salie-700">{actief.omschrijving}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => zetKortingscode(null)}
          aria-label="Kortingscode verwijderen"
          className="shrink-0 rounded-full p-1.5 text-salie-700 transition-colors hover:bg-salie-200"
        >
          <X className="size-4" />
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={toepassen} className="flex gap-2">
      <label htmlFor="kortingscode" className="sr-only">
        Kortingscode
      </label>
      <Input
        id="kortingscode"
        value={invoer}
        onChange={(e) => setInvoer(e.target.value)}
        placeholder="Kortingscode"
        className="flex-1"
      />
      <Button type="submit" variant="outline" disabled={!invoer.trim()}>
        <TicketPercent />
        Toepassen
      </Button>
    </form>
  );
}

/** Uitleg over de bezorgkosten: een minimumbedrag plus kilometers, bevestigd via WhatsApp. */
export function Bezorginfo() {
  return (
    <p className="flex items-start gap-2.5 rounded-2xl bg-creme-diep px-4 py-3.5 text-sm leading-relaxed text-inkt-zacht">
      <Truck className="mt-0.5 size-4 shrink-0 text-salie-700" />
      <span>
        Bezorging kost minimaal <span className="font-medium text-inkt">{formatPrijs(bedrijf.bezorgingVanaf)}</span>,
        plus {formatPrijs(bedrijf.bezorgingPerKm)} per extra kilometer. Het exacte bedrag bevestigen we via WhatsApp.
        Afhalen aan de {bedrijf.adres.straat} is gratis.
      </span>
    </p>
  );
}

/** Regels van het kostenoverzicht, gedeeld door winkelwagen en afrekenpagina. */
export function Kostenregels({ kosten }: { kosten: Kosten }) {
  return (
    <dl className="space-y-3 text-sm">
      <div className="flex justify-between">
        <dt className="text-inkt-zacht">Subtotaal</dt>
        <dd className="font-medium">{formatPrijs(kosten.subtotaal)}</dd>
      </div>

      {kosten.korting > 0 ? (
        <div className="flex justify-between text-salie-700">
          <dt>Korting</dt>
          <dd className="font-medium">-{formatPrijs(kosten.korting)}</dd>
        </div>
      ) : null}

      <div className="flex justify-between">
        <dt className="text-inkt-zacht">Bezorging</dt>
        <dd className="text-right font-medium">
          {kosten.bezorgingVanaf ? (
            <>
              vanaf {formatPrijs(kosten.bezorgkosten)}
              <span className="block text-xs font-normal text-inkt-zacht">
                + {formatPrijs(bedrijf.bezorgingPerKm)} per extra km
              </span>
            </>
          ) : (
            <span className="text-salie-700">Afhalen, gratis</span>
          )}
        </dd>
      </div>

      <div className="flex justify-between border-t border-border pt-3.5 font-display text-lg font-bold">
        <dt>Totaal</dt>
        <dd>
          {kosten.bezorgingVanaf ? (
            <span className="mr-1 font-sans text-sm font-normal text-inkt-zacht">vanaf</span>
          ) : null}
          {formatPrijs(kosten.totaal)}
        </dd>
      </div>

      {/*
        In de Surinaamse detailhandel zijn de prijzen inclusief BTW. Het bedrag
        wordt daarom uit het totaal gelicht in plaats van er bovenop geteld.
      */}
      <div className="flex justify-between text-xs text-inkt-zacht">
        <dt>Waarvan BTW ({Math.round(bedrijf.btwTarief * 100)}%)</dt>
        <dd>{formatPrijs(kosten.btwAandeel)}</dd>
      </div>
    </dl>
  );
}
