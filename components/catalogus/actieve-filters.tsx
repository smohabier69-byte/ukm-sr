"use client";

import { X } from "lucide-react";

import { formatPrijs } from "@/lib/format";
import type { Facetten, Filterstaat } from "@/lib/catalogus";

interface Chip {
  sleutel: string;
  label: string;
  verwijder: () => void;
}

/** Toont de gekozen filters als chips, zodat altijd zichtbaar is wat er weggefilterd wordt. */
export function ActieveFilters({
  staat,
  facetten,
  zet,
  wisAlles,
}: {
  staat: Filterstaat;
  facetten: Facetten;
  zet: (wijziging: Partial<Filterstaat>) => void;
  wisAlles: () => void;
}) {
  const chips: Chip[] = [];

  const groepen = [
    { sleutel: "categorieen", opties: facetten.categorieen },
    { sleutel: "technieken", opties: facetten.technieken },
    { sleutel: "vormen", opties: facetten.vormen },
    { sleutel: "kleuren", opties: facetten.kleuren },
    { sleutel: "sterktesoorten", opties: facetten.sterktesoorten },
    { sleutel: "merken", opties: facetten.merken },
  ] as const;

  for (const groep of groepen) {
    for (const waarde of staat[groep.sleutel]) {
      const optie = groep.opties.find((o) => o.waarde === waarde);
      chips.push({
        sleutel: `${groep.sleutel}-${waarde}`,
        label: optie?.label ?? waarde,
        verwijder: () => zet({ [groep.sleutel]: staat[groep.sleutel].filter((v) => v !== waarde) }),
      });
    }
  }

  if (staat.alleenOpVoorraad) {
    chips.push({
      sleutel: "voorraad",
      label: "Op voorraad",
      verwijder: () => zet({ alleenOpVoorraad: false }),
    });
  }
  if (staat.alleenAanbiedingen) {
    chips.push({
      sleutel: "aanbieding",
      label: "Aanbiedingen",
      verwijder: () => zet({ alleenAanbiedingen: false }),
    });
  }
  if (staat.minPrijs > facetten.minPrijs || staat.maxPrijs < facetten.maxPrijs) {
    chips.push({
      sleutel: "prijs",
      label: `${formatPrijs(staat.minPrijs)} - ${formatPrijs(staat.maxPrijs)}`,
      verwijder: () => zet({ minPrijs: facetten.minPrijs, maxPrijs: facetten.maxPrijs }),
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <button
          key={chip.sleutel}
          type="button"
          onClick={chip.verwijder}
          className="group inline-flex items-center gap-1.5 rounded-full border border-salie-300/60 bg-salie-50 py-1.5 pr-2 pl-3.5 text-xs font-medium text-salie-800 transition-colors hover:border-salie-400 hover:bg-salie-100"
        >
          {chip.label}
          <X className="size-3.5 text-salie-600 transition-colors group-hover:text-salie-800" />
          <span className="sr-only">Filter verwijderen</span>
        </button>
      ))}

      <button
        type="button"
        onClick={wisAlles}
        className="ml-1 text-xs font-medium text-inkt-zacht underline underline-offset-4 transition-colors hover:text-inkt"
      >
        Alles wissen
      </button>
    </div>
  );
}
