import type { Product } from "@/types/product";
import { zoekProducten } from "./zoeken";

export const sorteeropties = [
  { waarde: "aanbevolen", label: "Aanbevolen" },
  { waarde: "nieuwste", label: "Nieuwste eerst" },
  { waarde: "prijs-op", label: "Prijs: laag naar hoog" },
  { waarde: "prijs-af", label: "Prijs: hoog naar laag" },
  { waarde: "populariteit", label: "Populariteit" },
  { waarde: "waardering", label: "Best beoordeeld" },
  { waarde: "alfabetisch", label: "Naam: A tot Z" },
] as const;

export type Sorteersleutel = (typeof sorteeropties)[number]["waarde"];

export const isSorteersleutel = (waarde: string): waarde is Sorteersleutel =>
  sorteeropties.some((optie) => optie.waarde === waarde);

export interface Filterstaat {
  categorieen: string[];
  merken: string[];
  vormen: string[];
  kleuren: string[];
  technieken: string[];
  sterktesoorten: string[];
  minPrijs: number;
  maxPrijs: number;
  alleenOpVoorraad: boolean;
  alleenAanbiedingen: boolean;
  zoekterm: string;
  sorteer: Sorteersleutel;
}

export function legeFilterstaat(min: number, max: number): Filterstaat {
  return {
    categorieen: [],
    merken: [],
    vormen: [],
    kleuren: [],
    technieken: [],
    sterktesoorten: [],
    minPrijs: min,
    maxPrijs: max,
    alleenOpVoorraad: false,
    alleenAanbiedingen: false,
    zoekterm: "",
    sorteer: "aanbevolen",
  };
}

export interface Facetoptie {
  waarde: string;
  label: string;
  aantal: number;
}

export interface Facetten {
  categorieen: Facetoptie[];
  merken: Facetoptie[];
  vormen: Facetoptie[];
  kleuren: Facetoptie[];
  technieken: Facetoptie[];
  sterktesoorten: Facetoptie[];
  minPrijs: number;
  maxPrijs: number;
}

const vormlabels: Record<string, string> = {
  "cat-eye": "Cat eye",
  browline: "Browline",
  frameless: "Frameless",
  square: "Square",
  rectangle: "Rectangle",
  aviator: "Aviator",
  oval: "Oval",
  round: "Round",
  geometric: "Geometric",
  "cat-ear": "Cat ear",
  kids: "Kids",
};

const categorielabels: Record<string, string> = {
  ptc: "PTC photochroom",
  "anti-blauwlicht": "Anti-blauwlicht",
  kinderbrillen: "Kinderbrillen",
  "lenzen-met-sterkte": "Met sterkte",
  "lenzen-zonder-sterkte": "Zonder sterkte",
};

const merklabels: Record<string, string> = {
  "ukm-signature": "UKM Signature",
  "ukm-ptc": "UKM PTC",
  "ukm-clear": "UKM Clear",
  "ukm-kids": "UKM Kids",
  "ukm-vision": "UKM Vision",
  "ukm-soft-lenses": "UKM Soft Lenses",
};

const kleurlabels: Record<string, string> = {
  bruin: "Bruin",
  honing: "Honing",
  grijs: "Grijs",
  blauw: "Blauw",
  groen: "Groen",
  roze: "Roze en paars",
  zwart: "Zwart",
};

const technieklabels: Record<string, string> = {
  ptc: "Verkleurt in de zon (PTC)",
  "non-ptc": "Blijft helder",
};

const sterktelabels: Record<string, string> = {
  "met-sterkte": "Met sterkte",
  "zonder-sterkte": "Zonder sterkte",
};

function tel(
  producten: Product[],
  lees: (product: Product) => string | undefined,
  labels: Record<string, string>,
): Facetoptie[] {
  const aantallen = new Map<string, number>();
  for (const product of producten) {
    const waarde = lees(product);
    if (!waarde) continue;
    aantallen.set(waarde, (aantallen.get(waarde) ?? 0) + 1);
  }
  return [...aantallen.entries()]
    .map(([waarde, aantal]) => ({ waarde, label: labels[waarde] ?? waarde, aantal }))
    .sort((a, b) => b.aantal - a.aantal || a.label.localeCompare(b.label, "nl"));
}

/**
 * Bouwt de beschikbare filters op uit de producten die op deze pagina staan.
 * Een categoriepagina met alleen lenzen toont dus geen montuurvormen.
 */
export function bouwFacetten(producten: Product[]): Facetten {
  const prijzen = producten.map((p) => p.prijs);
  return {
    categorieen: tel(producten, (p) => p.categorie, categorielabels),
    merken: tel(producten, (p) => p.merk, merklabels),
    vormen: tel(producten, (p) => p.vorm, vormlabels),
    kleuren: tel(producten, (p) => p.kleurfamilie, kleurlabels),
    technieken: tel(producten, (p) => p.techniek, technieklabels),
    sterktesoorten: tel(producten, (p) => p.sterktesoort, sterktelabels),
    minPrijs: prijzen.length ? Math.min(...prijzen) : 0,
    maxPrijs: prijzen.length ? Math.max(...prijzen) : 0,
  };
}

function sorteer(producten: Product[], sleutel: Sorteersleutel): Product[] {
  const lijst = [...producten];
  switch (sleutel) {
    case "nieuwste":
      return lijst.sort((a, b) => b.toegevoegdOp.localeCompare(a.toegevoegdOp));
    case "prijs-op":
      return lijst.sort((a, b) => a.prijs - b.prijs);
    case "prijs-af":
      return lijst.sort((a, b) => b.prijs - a.prijs);
    case "populariteit":
      return lijst.sort((a, b) => b.populariteit - a.populariteit);
    case "waardering":
      return lijst.sort((a, b) => b.score - a.score || b.aantalBeoordelingen - a.aantalBeoordelingen);
    case "alfabetisch":
      return lijst.sort((a, b) => a.naam.localeCompare(b.naam, "nl"));
    case "aanbevolen":
    default:
      // Op voorraad eerst, daarna de mix van populariteit en waardering.
      return lijst.sort(
        (a, b) =>
          Number(b.voorraad > 0) - Number(a.voorraad > 0) ||
          b.populariteit * 0.7 + b.score * 6 - (a.populariteit * 0.7 + a.score * 6),
      );
  }
}

const past = (gekozen: string[], waarde: string | undefined) =>
  gekozen.length === 0 || (waarde !== undefined && gekozen.includes(waarde));

/** Past alle filters toe en sorteert het resultaat. */
export function filterProducten(producten: Product[], staat: Filterstaat): Product[] {
  const gefilterd = producten.filter(
    (p) =>
      past(staat.categorieen, p.categorie) &&
      past(staat.merken, p.merk) &&
      past(staat.vormen, p.vorm) &&
      past(staat.kleuren, p.kleurfamilie) &&
      past(staat.technieken, p.techniek) &&
      past(staat.sterktesoorten, p.sterktesoort) &&
      p.prijs >= staat.minPrijs &&
      p.prijs <= staat.maxPrijs &&
      (!staat.alleenOpVoorraad || p.voorraad > 0) &&
      (!staat.alleenAanbiedingen || (p.vanPrijs !== undefined && p.vanPrijs > p.prijs)),
  );

  // Bij een zoekterm bepaalt de relevantie de volgorde, tenzij expliciet anders gesorteerd.
  if (staat.zoekterm.trim()) {
    const gescoord = zoekProducten(gefilterd, staat.zoekterm).map((r) => r.product);
    return staat.sorteer === "aanbevolen" ? gescoord : sorteer(gescoord, staat.sorteer);
  }

  return sorteer(gefilterd, staat.sorteer);
}

/** Telt hoeveel filters de bezoeker heeft aangezet, voor de teller op de knop. */
export function aantalActieveFilters(staat: Filterstaat, facetten: Facetten): number {
  return (
    staat.categorieen.length +
    staat.merken.length +
    staat.vormen.length +
    staat.kleuren.length +
    staat.technieken.length +
    staat.sterktesoorten.length +
    (staat.alleenOpVoorraad ? 1 : 0) +
    (staat.alleenAanbiedingen ? 1 : 0) +
    (staat.minPrijs > facetten.minPrijs || staat.maxPrijs < facetten.maxPrijs ? 1 : 0)
  );
}

/** Zet de filterstaat om naar zoekparameters, zodat een selectie deelbaar is. */
export function naarZoekparameters(staat: Filterstaat, facetten: Facetten): URLSearchParams {
  const params = new URLSearchParams();
  const lijsten: [string, string[]][] = [
    ["categorie", staat.categorieen],
    ["merk", staat.merken],
    ["vorm", staat.vormen],
    ["kleur", staat.kleuren],
    ["techniek", staat.technieken],
    ["sterkte", staat.sterktesoorten],
  ];
  for (const [sleutel, waarden] of lijsten) {
    for (const waarde of waarden) params.append(sleutel, waarde);
  }
  if (staat.minPrijs > facetten.minPrijs) params.set("vanaf", String(staat.minPrijs));
  if (staat.maxPrijs < facetten.maxPrijs) params.set("tot", String(staat.maxPrijs));
  if (staat.alleenOpVoorraad) params.set("voorraad", "1");
  if (staat.alleenAanbiedingen) params.set("aanbieding", "1");
  if (staat.zoekterm.trim()) params.set("q", staat.zoekterm.trim());
  if (staat.sorteer !== "aanbevolen") params.set("sorteer", staat.sorteer);
  return params;
}

/** Leest een filterstaat terug uit de URL, zodat gedeelde links werken. */
export function uitZoekparameters(
  params: Record<string, string | string[] | undefined>,
  facetten: Facetten,
): Filterstaat {
  const lijst = (sleutel: string): string[] => {
    const waarde = params[sleutel];
    if (!waarde) return [];
    return Array.isArray(waarde) ? waarde : [waarde];
  };
  const enkel = (sleutel: string): string | undefined => {
    const waarde = params[sleutel];
    return Array.isArray(waarde) ? waarde[0] : waarde;
  };
  const getal = (sleutel: string, standaard: number): number => {
    const waarde = Number(enkel(sleutel));
    return Number.isFinite(waarde) ? waarde : standaard;
  };

  const sorteerwaarde = enkel("sorteer");

  return {
    categorieen: lijst("categorie"),
    merken: lijst("merk"),
    vormen: lijst("vorm"),
    kleuren: lijst("kleur"),
    technieken: lijst("techniek"),
    sterktesoorten: lijst("sterkte"),
    minPrijs: getal("vanaf", facetten.minPrijs),
    maxPrijs: getal("tot", facetten.maxPrijs),
    alleenOpVoorraad: enkel("voorraad") === "1",
    alleenAanbiedingen: enkel("aanbieding") === "1",
    zoekterm: enkel("q") ?? "",
    sorteer: sorteerwaarde && isSorteersleutel(sorteerwaarde) ? sorteerwaarde : "aanbevolen",
  };
}

export { vormlabels, categorielabels, merklabels, kleurlabels };
