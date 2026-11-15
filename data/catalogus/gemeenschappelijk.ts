import type { Montuurvorm, Specificatie, Techniek } from "@/types/product";

/**
 * Redactionele bouwstenen voor de productteksten.
 *
 * Alles hier is afgeleid van wat de prijslijsten (november 2026) zelf
 * vermelden. Er staan bewust geen afmetingen, gewichten of percentages in die
 * UKM niet opgeeft: een specificatie die niet uit de prijslijst komt, hoort
 * niet op de productpagina.
 */

/** Uitgavedatum van de prijslijsten waarop het assortiment is gebaseerd. */
export const CATALOGUSDATUM = "2026-11-01";
/** Modellen zonder "NEW"-lint stonden al in de vorige uitgave. */
export const VORIGE_UITGAVE = "2026-09-01";

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
    karakter: "Zonder zichtbare rand blijft het gezicht open; alleen de glazen en de dunne veren zijn te zien.",
    pasvorm: "Ideaal voor wie liever niet ziet dat er een bril op zit.",
  },
  square: {
    naam: "Square",
    karakter: "Rechte lijnen en zachte hoeken geven dit vierkante montuur een rustige, hedendaagse uitstraling.",
    pasvorm: "Brengt balans bij rondere gezichtsvormen.",
  },
  rectangle: {
    naam: "Rectangle",
    karakter: "Een smal, rechthoekig montuur dat nauwelijks ruimte inneemt op het gezicht.",
    pasvorm: "Werkt goed bij smallere en langere gezichten.",
  },
  aviator: {
    naam: "Aviator",
    karakter: "De dubbele brug en druppelvormige glazen van deze aviator zijn tijdloos.",
    pasvorm: "Kleedt vrijwel elke gezichtsvorm, van vierkant tot ovaal.",
  },
  oval: {
    naam: "Oval",
    karakter: "Zachte, doorlopende rondingen zonder scherpe hoeken, waardoor het montuur nooit streng oogt.",
    pasvorm: "Verzacht hoekige gezichtslijnen.",
  },
  round: {
    naam: "Round",
    karakter: "Een rond montuur met een eigenzinnig, kunstzinnig karakter.",
    pasvorm: "Op zijn mooist bij hoekige en vierkante gezichten.",
  },
  geometric: {
    naam: "Geometric",
    karakter: "Een hoekige, veelvlakkige vorm die duidelijk afwijkt van de standaard en meteen als statement leest.",
    pasvorm: "Voor wie bewust iets anders wil dan rond of vierkant.",
  },
  "cat-ear": {
    naam: "Cat ear",
    karakter: "De speelse oortjes bovenop het montuur maken dit model onmiskenbaar; grappig, maar netjes uitgevoerd.",
    pasvorm: "Een geliefd cadeaumodel.",
  },
  sport: {
    naam: "Sport",
    karakter: "Een gebogen sportmontuur dat dicht om het gezicht sluit en ook in beweging blijft zitten.",
    pasvorm: "Gemaakt voor hardlopen, fietsen en lange dagen buiten.",
  },
  kids: {
    naam: "Kids",
    karakter: "Een licht montuur op kindermaat.",
    pasvorm: "Geschikt voor kinderen.",
  },
};

export const techniekprofielen: Record<Techniek, { label: string; tekst: string; kenmerken: string[] }> = {
  ptc: {
    label: "PTC photochroom",
    tekst:
      "De glazen hebben onze Photochromic Technology Coating: binnen blijven ze helder, in zonlicht kleuren ze vanzelf donker en daarna worden ze weer helder. Zo heb je bescherming tegen blauw licht en tegen UV in een enkele bril.",
    kenmerken: [
      "Kleurt automatisch donker in zonlicht",
      "Helder binnenshuis",
      "Beschermt tegen UV-straling",
      "Filtert blauw licht van schermen",
    ],
  },
  "non-ptc": {
    label: "Anti-blauwlicht",
    tekst:
      "De glazen blijven altijd helder en filteren het blauwe licht van telefoon, laptop en televisie. Fijn voor wie meer dan een paar uur per dag achter een scherm zit.",
    kenmerken: ["Filtert blauw licht van schermen", "Blijft helder, verkleurt niet"],
  },
};

export function brilSpecificaties(input: {
  vorm: Montuurvorm;
  techniek: Techniek;
  kleur: string;
  sterktes?: string;
}): Specificatie[] {
  const { vorm, techniek, kleur, sterktes } = input;
  return [
    { label: "Montuurvorm", waarde: vormprofielen[vorm].naam },
    { label: "Uitvoering", waarde: kleur },
    { label: "Glastype", waarde: techniek === "ptc" ? "Photochroom (PTC)" : "Helder, anti-blauwlicht" },
    { label: "Blauwlichtfilter", waarde: "Ja" },
    { label: "In de zon", waarde: techniek === "ptc" ? "Kleurt donker, beschermt tegen UV" : "Blijft helder" },
    ...(sterktes ? [{ label: "Leessterktes", waarde: sterktes }] : []),
  ];
}

/** Vaste specificaties uit de prijslijst; gelden voor het hele lenzenassortiment. */
export function lensSpecificaties(input: { sterkte: string; code?: string }): Specificatie[] {
  return [
    ...(input.code ? [{ label: "Artikelcode", waarde: input.code }] : []),
    { label: "Sterkte", waarde: input.sterkte },
    { label: "Diameter (DIA)", waarde: "14.0 - 14.5 mm" },
    { label: "Basiscurve", waarde: "8.6 mm" },
    { label: "Watergehalte", waarde: "38% - 42%" },
    { label: "Materiaal", waarde: "58% - 62% PHEMA" },
    { label: "Houdbaarheid", waarde: "6 maanden" },
    { label: "Certificering", waarde: "FDA, GMP, ISO en CE goedgekeurd" },
  ];
}

export const lensKenmerken = [
  "Zacht en comfortabel om te dragen",
  "FDA, GMP, ISO en CE goedgekeurd",
  "6 maanden houdbaar",
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
    tekst: "Goudbruin met een lichte gloed rond de pupil. In daglicht komt de honingtoon het sterkst naar voren.",
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
    tekst: "Blauw met fijne vertakkingen naar het midden toe, waardoor de lens levendig blijft in plaats van vlak.",
  },
  groen: {
    familie: "Groen",
    swatch: "#6f8b5e",
    tekst: "Groen met een natuurlijke ondertoon, een van de meest gevraagde kleuren uit het assortiment.",
  },
  roze: {
    familie: "Roze",
    swatch: "#b57289",
    tekst: "Roze tot violet met een warme gloed. Uitgesproken in fel licht, verrassend zacht binnenshuis.",
  },
  zwart: {
    familie: "Zwart",
    swatch: "#2b2b2f",
    tekst: "Een diepzwarte lens met brede rand die de iris optisch vergroot; het klassieke doll eye-effect.",
  },
};
