import { producten } from "@/data/producten";
import { categorielabels, merklabels } from "@/lib/catalogus";
import { bestellingen, geldigeBestellingen, type Bestelstatus } from "./bestellingen";
import { klanten } from "./klanten";
import { PEILDATUM, isoDatum, maandnamen } from "./basis";

const productOpSlug = new Map(producten.map((p) => [p.slug, p]));

function dagenTussen(datum: string): number {
  return Math.round((PEILDATUM.getTime() - new Date(datum).getTime()) / 86_400_000);
}

/* -------------------------------------------------------------------------- */
/* Kerncijfers                                                                 */
/* -------------------------------------------------------------------------- */

export interface Kerncijfer {
  sleutel: string;
  label: string;
  waarde: number;
  vorigeWaarde: number;
  eenheid: "srd" | "aantal";
  /** Reeks van dertig punten voor het lijntje in de tegel. */
  reeks: number[];
}

function omzetInVenster(vanDagen: number, totDagen: number): number {
  return geldigeBestellingen
    .filter((b) => {
      const d = dagenTussen(b.datum);
      return d >= totDagen && d < vanDagen;
    })
    .reduce((som, b) => som + b.totaal, 0);
}

function aantalInVenster(vanDagen: number, totDagen: number): number {
  return geldigeBestellingen.filter((b) => {
    const d = dagenTussen(b.datum);
    return d >= totDagen && d < vanDagen;
  }).length;
}

/** Dagomzet over de laatste dertig dagen, oudste eerst. */
const dagreeks: number[] = Array.from({ length: 30 }, (_, i) => {
  const dag = 29 - i;
  return geldigeBestellingen
    .filter((b) => dagenTussen(b.datum) === dag)
    .reduce((som, b) => som + b.totaal, 0);
});

const dagreeksAantal: number[] = Array.from({ length: 30 }, (_, i) => {
  const dag = 29 - i;
  return geldigeBestellingen.filter((b) => dagenTussen(b.datum) === dag).length;
});

const omzet30 = omzetInVenster(30, 0);
const omzet60 = omzetInVenster(60, 30);
const orders30 = aantalInVenster(30, 0);
const orders60 = aantalInVenster(60, 30);

const nieuweKlanten30 = klanten.filter((k) => dagenTussen(k.klantSinds) < 30).length;
const nieuweKlanten60 = klanten.filter((k) => {
  const d = dagenTussen(k.klantSinds);
  return d >= 30 && d < 60;
}).length;

export const kerncijfers: Kerncijfer[] = [
  {
    sleutel: "omzet",
    label: "Omzet",
    waarde: omzet30,
    vorigeWaarde: omzet60,
    eenheid: "srd",
    reeks: dagreeks,
  },
  {
    sleutel: "bestellingen",
    label: "Bestellingen",
    waarde: orders30,
    vorigeWaarde: orders60,
    eenheid: "aantal",
    reeks: dagreeksAantal,
  },
  {
    sleutel: "gemiddelde",
    label: "Gemiddelde bestelwaarde",
    waarde: orders30 ? Math.round(omzet30 / orders30) : 0,
    vorigeWaarde: orders60 ? Math.round(omzet60 / orders60) : 0,
    eenheid: "srd",
    reeks: dagreeks.map((omzet, i) => (dagreeksAantal[i] ? Math.round(omzet / dagreeksAantal[i]) : 0)),
  },
  {
    sleutel: "klanten",
    label: "Nieuwe klanten",
    waarde: nieuweKlanten30,
    vorigeWaarde: nieuweKlanten60,
    eenheid: "aantal",
    reeks: Array.from({ length: 30 }, (_, i) =>
      klanten.filter((k) => dagenTussen(k.klantSinds) === 29 - i).length,
    ),
  },
];

/* -------------------------------------------------------------------------- */
/* Reeksen                                                                     */
/* -------------------------------------------------------------------------- */

export interface Maandpunt {
  label: string;
  omzet: number;
  bestellingen: number;
  brillen: number;
  lenzen: number;
}

/** Twaalf maanden omzet, gesplitst naar brillen en lenzen. */
export const maandreeks: Maandpunt[] = Array.from({ length: 12 }, (_, i) => {
  const maandTerug = 11 - i;
  const start = new Date(
    Date.UTC(PEILDATUM.getUTCFullYear(), PEILDATUM.getUTCMonth() - maandTerug, 1),
  );
  const eind = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 1));

  const inMaand = geldigeBestellingen.filter((b) => {
    const d = new Date(b.datum);
    return d >= start && d < eind;
  });

  let brillen = 0;
  let lenzen = 0;
  for (const bestelling of inMaand) {
    for (const regel of bestelling.regels) {
      const product = productOpSlug.get(regel.slug);
      if (!product) continue;
      const bedrag = regel.stukprijs * regel.aantal;
      if (product.soort === "bril") brillen += bedrag;
      else lenzen += bedrag;
    }
  }

  return {
    label: maandnamen[start.getUTCMonth()],
    omzet: inMaand.reduce((som, b) => som + b.totaal, 0),
    bestellingen: inMaand.length,
    brillen,
    lenzen,
  };
});

export interface Verdeelpunt {
  label: string;
  waarde: number;
}

/** Omzet per categorie, hoogste eerst. */
export const omzetPerCategorie: Verdeelpunt[] = (() => {
  const totalen = new Map<string, number>();
  for (const bestelling of geldigeBestellingen) {
    for (const regel of bestelling.regels) {
      const product = productOpSlug.get(regel.slug);
      if (!product) continue;
      totalen.set(
        product.categorie,
        (totalen.get(product.categorie) ?? 0) + regel.stukprijs * regel.aantal,
      );
    }
  }
  return [...totalen.entries()]
    .map(([slug, waarde]) => ({ label: categorielabels[slug] ?? slug, waarde }))
    .sort((a, b) => b.waarde - a.waarde);
})();

export const omzetPerMerk: Verdeelpunt[] = (() => {
  const totalen = new Map<string, number>();
  for (const bestelling of geldigeBestellingen) {
    for (const regel of bestelling.regels) {
      const product = productOpSlug.get(regel.slug);
      if (!product) continue;
      totalen.set(product.merk, (totalen.get(product.merk) ?? 0) + regel.stukprijs * regel.aantal);
    }
  }
  return [...totalen.entries()]
    .map(([slug, waarde]) => ({ label: merklabels[slug] ?? slug, waarde }))
    .sort((a, b) => b.waarde - a.waarde);
})();

export interface Topproduct {
  slug: string;
  naam: string;
  afbeelding: string;
  aantal: number;
  omzet: number;
}

export const topProducten: Topproduct[] = (() => {
  const totalen = new Map<string, { aantal: number; omzet: number }>();
  for (const bestelling of geldigeBestellingen) {
    for (const regel of bestelling.regels) {
      const huidig = totalen.get(regel.slug) ?? { aantal: 0, omzet: 0 };
      huidig.aantal += regel.aantal;
      huidig.omzet += regel.stukprijs * regel.aantal;
      totalen.set(regel.slug, huidig);
    }
  }
  return [...totalen.entries()]
    .map(([slug, cijfers]) => {
      const product = productOpSlug.get(slug)!;
      return { slug, naam: product.naam, afbeelding: product.afbeeldingen[0], ...cijfers };
    })
    .sort((a, b) => b.omzet - a.omzet);
})();

/** Verdeling van bestellingen over de statussen. */
export const statusverdeling: { status: Bestelstatus; aantal: number }[] = (
  ["nieuw", "in-behandeling", "onderweg", "afgerond", "geannuleerd"] as Bestelstatus[]
).map((status) => ({ status, aantal: bestellingen.filter((b) => b.status === status).length }));

/* -------------------------------------------------------------------------- */
/* Voorraad                                                                    */
/* -------------------------------------------------------------------------- */

export const DREMPEL_LAGE_VOORRAAD = 5;

export const voorraadwaarschuwingen = producten
  .filter((p) => p.voorraad <= DREMPEL_LAGE_VOORRAAD)
  .sort((a, b) => a.voorraad - b.voorraad);

export const voorraadwaarde = producten.reduce((som, p) => som + p.prijs * p.voorraad, 0);

export const voorraadsamenvatting = {
  artikelen: producten.length,
  opVoorraad: producten.filter((p) => p.voorraad > DREMPEL_LAGE_VOORRAAD).length,
  bijnaOp: producten.filter((p) => p.voorraad > 0 && p.voorraad <= DREMPEL_LAGE_VOORRAAD).length,
  uitverkocht: producten.filter((p) => p.voorraad === 0).length,
  stuks: producten.reduce((som, p) => som + p.voorraad, 0),
  waarde: voorraadwaarde,
};

/** Klanten met hun bestelgeschiedenis erbij, voor de klantenlijst. */
export const klantoverzicht = klanten
  .map((klant) => {
    const eigen = geldigeBestellingen.filter((b) => b.klantId === klant.id);
    return {
      ...klant,
      bestellingen: eigen.length,
      besteed: eigen.reduce((som, b) => som + b.totaal, 0),
      laatsteBestelling: eigen.length ? eigen[0].datum : null,
    };
  })
  .sort((a, b) => b.besteed - a.besteed);

export const peildatumLabel = isoDatum(PEILDATUM);
