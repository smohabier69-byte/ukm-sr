import type { Montuurvorm, Specificatie, Techniek } from "@/types/product";

/**
 * Deterministische pseudo-toevalsgetallen.
 *
 * Voorraad, waarderingen en populariteit zijn demowaarden. Ze worden uit de
 * slug afgeleid in plaats van willekeurig getrokken, zodat server en client
 * exact dezelfde cijfers renderen en er geen hydratieverschil ontstaat.
 */
function zaad(sleutel: string): number {
  let h = 2166136261;
  for (let i = 0; i < sleutel.length; i++) {
    h ^= sleutel.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function tussen(slug: string, veld: string, min: number, max: number): number {
  return min + (zaad(`${slug}:${veld}`) % (max - min + 1));
}

export function keuze<T>(slug: string, veld: string, opties: readonly T[]): T {
  return opties[zaad(`${slug}:${veld}`) % opties.length];
}

/** Waardering tussen 4.0 en 5.0, met een decimaal. */
export function waardering(slug: string): number {
  return Math.round((40 + (zaad(`${slug}:score`) % 11)) / 10 * 10) / 10;
}

/** Datum binnen de afgelopen achttien maanden, geteld vanaf de catalogusdatum. */
const PEILDATUM = new Date("2026-04-01T00:00:00Z");

export function toegevoegdOp(slug: string): string {
  const dagenTerug = tussen(slug, "leeftijd", 0, 540);
  const d = new Date(PEILDATUM.getTime() - dagenTerug * 86_400_000);
  return d.toISOString().slice(0, 10);
}

/* -------------------------------------------------------------------------- */
/* Redactionele bouwstenen                                                     */
/* -------------------------------------------------------------------------- */

interface Vormprofiel {
  naam: string;
  karakter: string;
  pasvorm: string;
}

export const vormprofielen: Record<Montuurvorm, Vormprofiel> = {
  "cat-eye": {
    naam: "Cat eye",
    karakter:
      "De opwaartse punten van dit cat eye-montuur tillen de blik op en geven het gezicht een uitgesproken, verzorgde lijn.",
    pasvorm: "Staat bijzonder goed bij ronde en hartvormige gezichten.",
  },
  browline: {
    naam: "Browline",
    karakter:
      "Een browline zet het accent op de bovenrand en laat de onderkant vrij, wat het montuur lichter maakt dan het lijkt.",
    pasvorm: "Een veilige keuze voor wie iets klassieks zoekt dat toch opvalt.",
  },
  frameless: {
    naam: "Frameless",
    karakter:
      "Zonder zichtbare rand blijft het gezicht open; alleen de glazen en de dunne veren zijn te zien.",
    pasvorm: "Ideaal voor wie liever niet ziet dat er een bril op zit.",
  },
  square: {
    naam: "Square",
    karakter:
      "Rechte lijnen en zachte hoeken geven dit vierkante montuur een rustige, hedendaagse uitstraling.",
    pasvorm: "Brengt balans bij rondere gezichtsvormen.",
  },
  rectangle: {
    naam: "Rectangle",
    karakter:
      "Een breed, licht rechthoekig montuur dat het gezicht optisch verbreedt zonder zwaar te worden.",
    pasvorm: "Werkt goed bij smallere en langere gezichten.",
  },
  aviator: {
    naam: "Aviator",
    karakter:
      "De dubbele brug en druppelvormige glazen van deze aviator zijn tijdloos en dragen bijna gewichtloos.",
    pasvorm: "Kleedt vrijwel elke gezichtsvorm, van vierkant tot ovaal.",
  },
  oval: {
    naam: "Oval",
    karakter:
      "Zachte, doorlopende rondingen zonder scherpe hoeken, waardoor het montuur nooit streng oogt.",
    pasvorm: "Verzacht hoekige gezichtslijnen.",
  },
  round: {
    naam: "Round",
    karakter: "Een volledig rond montuur met een eigenzinnig, kunstzinnig karakter.",
    pasvorm: "Op zijn mooist bij hoekige en vierkante gezichten.",
  },
  geometric: {
    naam: "Geometric",
    karakter:
      "Een hoekige, veelvlakkige vorm die duidelijk afwijkt van de standaard en meteen als statement leest.",
    pasvorm: "Voor wie bewust iets anders wil dan rond of vierkant.",
  },
  "cat-ear": {
    naam: "Cat ear",
    karakter:
      "De speelse oortjes bovenop het montuur maken dit model onmiskenbaar; grappig, maar netjes uitgevoerd.",
    pasvorm: "Een geliefd cadeaumodel en een vaste favoriet in de winkel.",
  },
  kids: {
    naam: "Kids",
    karakter:
      "Een licht en buigzaam montuur op kindermaat, gemaakt om tegen een stootje te kunnen.",
    pasvorm: "Geschikt voor kinderen van ongeveer vier tot twaalf jaar.",
  },
};

export const techniekprofielen: Record<Techniek, { label: string; tekst: string; kenmerken: string[] }> = {
  ptc: {
    label: "PTC photochroom",
    tekst:
      "De glazen zijn voorzien van onze Photochromic Technology Coating: binnen blijven ze volledig helder, in de zon kleuren ze binnen enkele seconden donker en buiten fel zonlicht keren ze weer terug. Zo heb je bescherming tegen blauw licht en tegen UV in een montuur, zonder te wisselen van bril.",
    kenmerken: [
      "Verkleurt automatisch in zonlicht",
      "Volledig helder binnenshuis",
      "Blokkeert 400+ nm UV-straling",
      "Filtert blauw licht van schermen",
    ],
  },
  "non-ptc": {
    label: "Anti-blauwlicht",
    tekst:
      "De glazen blijven altijd helder en filteren het blauwe licht van telefoons, laptops en televisies. Dat scheelt merkbaar bij lange schermdagen: minder branderige ogen aan het eind van de middag en rustiger inslapen na een avond doorwerken.",
    kenmerken: [
      "Filtert blauw licht van schermen",
      "Blijft helder, verkleurt niet",
      "Vermindert vermoeide ogen",
      "Ondersteunt een rustiger slaapritme",
    ],
  },
};

export const brilKenmerkenBasis = [
  "Lichtgewicht montuur met veerscharnieren",
  "Antikras-coating op beide glaszijden",
  "Inclusief hoes en microvezeldoekje",
];

export function brilSpecificaties(input: {
  vorm: Montuurvorm;
  techniek: Techniek;
  materiaal: string;
  slug: string;
}): Specificatie[] {
  const { vorm, techniek, materiaal, slug } = input;
  return [
    { label: "Montuurvorm", waarde: vormprofielen[vorm].naam },
    { label: "Glastype", waarde: techniek === "ptc" ? "Photochroom (PTC)" : "Helder, anti-blauwlicht" },
    { label: "Blauwlichtfilter", waarde: `${tussen(slug, "filter", 88, 96)}%` },
    { label: "UV-bescherming", waarde: techniek === "ptc" ? "UV400" : "UV380" },
    { label: "Montuurmateriaal", waarde: materiaal },
    { label: "Glasbreedte", waarde: `${tussen(slug, "glas", 48, 56)} mm` },
    { label: "Brugbreedte", waarde: `${tussen(slug, "brug", 15, 21)} mm` },
    { label: "Veerlengte", waarde: `${tussen(slug, "veer", 138, 148)} mm` },
    { label: "Gewicht", waarde: `${tussen(slug, "gewicht", 17, 31)} gram` },
    { label: "Meegeleverd", waarde: "Brillenhoes en poetsdoekje" },
  ];
}

/** Vaste specificaties uit de prijslijst; gelden voor het hele lenzenassortiment. */
export function lensSpecificaties(input: { sterkte: string; slug: string }): Specificatie[] {
  return [
    { label: "Diameter (DIA)", waarde: "14.0 - 14.5 mm" },
    { label: "Basiscurve", waarde: "8.6 mm" },
    { label: "Sterkte", waarde: input.sterkte },
    { label: "Watergehalte", waarde: "38% - 42%" },
    { label: "Materiaal", waarde: "58% - 62% PHEMA" },
    { label: "Houdbaarheid", waarde: "6 maanden na openen" },
    { label: "Draagduur", waarde: `Maximaal ${tussen(input.slug, "draagduur", 6, 8)} uur per dag` },
    { label: "Verpakking", waarde: "Set van 2 lenzen in steriele vloeistof" },
    { label: "Certificering", waarde: "FDA, GMP, ISO en CE goedgekeurd" },
  ];
}

export const lensKenmerken = [
  "Zacht en comfortabel om te dragen",
  "Natuurlijk kleurverloop met zachte rand",
  "FDA, GMP, ISO en CE goedgekeurd",
  "Zes maanden houdbaar na openen",
];

interface Kleurprofiel {
  familie: string;
  swatch: string;
  tekst: string;
}

export type Kleurfamilie = "bruin" | "honing" | "grijs" | "blauw" | "groen" | "roze" | "zwart";

/** Redactionele omschrijving per kleurfamilie voor de lenzen. */
export const kleurprofielen: Record<Kleurfamilie, Kleurprofiel> = {
  bruin: {
    familie: "Bruin",
    swatch: "#8a5a34",
    tekst:
      "Een warme bruintint die dicht bij een natuurlijke oogkleur blijft. De lens licht donkere ogen op zonder dat meteen te zien is dat je lenzen draagt.",
  },
  honing: {
    familie: "Honing",
    swatch: "#b8843b",
    tekst:
      "Goudbruin met een lichte gloed rond de pupil. In daglicht komt de honingtoon het sterkst naar voren.",
  },
  grijs: {
    familie: "Grijs",
    swatch: "#8d949a",
    tekst:
      "Koel grijs met een donkere buitenrand die het oog scherper aftekent. Subtiel op donkere ogen, uitgesproken op lichte.",
  },
  blauw: {
    familie: "Blauw",
    swatch: "#5b7fae",
    tekst:
      "Helder blauw met fijne vertakkingen naar het midden toe, waardoor de lens levendig blijft in plaats van vlak.",
  },
  groen: {
    familie: "Groen",
    swatch: "#6f8b5e",
    tekst:
      "Zachtgroen met bruine ondertoon, een van de meest natuurlijk ogende kleuren uit het assortiment.",
  },
  roze: {
    familie: "Roze",
    swatch: "#b57289",
    tekst:
      "Roze tot violet met een warme gloed. Uitgesproken in fel licht, verrassend zacht binnenshuis.",
  },
  zwart: {
    familie: "Zwart",
    swatch: "#2b2b2f",
    tekst:
      "Een diepzwarte lens met brede rand die de iris optisch vergroot; het klassieke doll eye-effect.",
  },
};
