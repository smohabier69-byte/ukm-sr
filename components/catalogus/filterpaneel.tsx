"use client";

import * as React from "react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { formatPrijs } from "@/lib/format";
import type { Facetoptie, Facetten, Filterstaat } from "@/lib/catalogus";

type Lijstsleutel = "categorieen" | "merken" | "vormen" | "kleuren" | "technieken" | "sterktesoorten";

interface Groep {
  sleutel: Lijstsleutel;
  titel: string;
  opties: Facetoptie[];
}

export function Filterpaneel({
  staat,
  facetten,
  zet,
}: {
  staat: Filterstaat;
  facetten: Facetten;
  zet: (wijziging: Partial<Filterstaat>) => void;
}) {
  const wissel = (sleutel: Lijstsleutel, waarde: string) => {
    const huidig = staat[sleutel];
    zet({
      [sleutel]: huidig.includes(waarde) ? huidig.filter((v) => v !== waarde) : [...huidig, waarde],
    });
  };

  // Een groep met een enkele optie filtert niets weg en wordt daarom weggelaten.
  const groepen: Groep[] = (
    [
      { sleutel: "categorieen", titel: "Categorie", opties: facetten.categorieen },
      { sleutel: "technieken", titel: "Glastype", opties: facetten.technieken },
      { sleutel: "vormen", titel: "Montuurvorm", opties: facetten.vormen },
      { sleutel: "kleuren", titel: "Kleur", opties: facetten.kleuren },
      { sleutel: "sterktesoorten", titel: "Sterkte", opties: facetten.sterktesoorten },
      { sleutel: "merken", titel: "Huislijn", opties: facetten.merken },
    ] satisfies Groep[]
  ).filter((groep) => groep.opties.length > 1);

  const standaardOpen = ["beschikbaarheid", "prijs", ...groepen.slice(0, 2).map((g) => g.sleutel)];

  return (
    <div>
      <Accordion type="multiple" defaultValue={standaardOpen}>
        <AccordionItem value="beschikbaarheid">
          <AccordionTrigger>Beschikbaarheid</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3">
              <Aanvinkregel
                id="filter-voorraad"
                label="Alleen op voorraad"
                aangevinkt={staat.alleenOpVoorraad}
                bijWijziging={(v) => zet({ alleenOpVoorraad: v })}
              />
              <Aanvinkregel
                id="filter-aanbieding"
                label="Alleen aanbiedingen"
                aangevinkt={staat.alleenAanbiedingen}
                bijWijziging={(v) => zet({ alleenAanbiedingen: v })}
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="prijs">
          <AccordionTrigger>Prijs</AccordionTrigger>
          <AccordionContent>
            <div className="pt-1">
              <Slider
                value={[staat.minPrijs, staat.maxPrijs]}
                min={facetten.minPrijs}
                max={facetten.maxPrijs}
                step={25}
                minStepsBetweenThumbs={1}
                onValueChange={([min, max]) => zet({ minPrijs: min, maxPrijs: max })}
                aria-label="Prijsbereik"
              />
              <div className="mt-4 flex items-center justify-between text-xs text-inkt-zacht">
                <span>{formatPrijs(staat.minPrijs)}</span>
                <span>{formatPrijs(staat.maxPrijs)}</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {groepen.map((groep) => (
          <AccordionItem key={groep.sleutel} value={groep.sleutel}>
            <AccordionTrigger>{groep.titel}</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3">
                {groep.opties.map((optie) => (
                  <Aanvinkregel
                    key={optie.waarde}
                    id={`filter-${groep.sleutel}-${optie.waarde}`}
                    label={optie.label}
                    aantal={optie.aantal}
                    aangevinkt={staat[groep.sleutel].includes(optie.waarde)}
                    bijWijziging={() => wissel(groep.sleutel, optie.waarde)}
                  />
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

function Aanvinkregel({
  id,
  label,
  aantal,
  aangevinkt,
  bijWijziging,
}: {
  id: string;
  label: string;
  aantal?: number;
  aangevinkt: boolean;
  bijWijziging: (waarde: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <Checkbox id={id} checked={aangevinkt} onCheckedChange={(v) => bijWijziging(v === true)} />
      <label htmlFor={id} className="flex flex-1 cursor-pointer items-center justify-between gap-2 text-sm">
        <span className="text-inkt">{label}</span>
        {aantal !== undefined ? <span className="text-xs text-inkt-zacht">{aantal}</span> : null}
      </label>
    </div>
  );
}
