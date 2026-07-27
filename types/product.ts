/** Hoofdindeling van het assortiment. */
export type Productsoort = "bril" | "lens";

/**
 * De twee brillenlijnen uit de prijslijst. PTC staat voor Photochromic
 * Technology Coating: helder binnen, donker in de zon.
 */
export type Techniek = "non-ptc" | "ptc";

/** Of een kleurlens op sterkte geleverd wordt. */
export type Sterktesoort = "met-sterkte" | "zonder-sterkte";

export type Montuurvorm =
  | "cat-eye"
  | "browline"
  | "frameless"
  | "square"
  | "rectangle"
  | "aviator"
  | "oval"
  | "round"
  | "geometric"
  | "cat-ear"
  | "kids";

export interface Variant {
  /** Stabiele sleutel binnen het product, bijvoorbeeld "gold". */
  id: string;
  naam: string;
  /** Hexwaarde voor het kleurstipje in de productkaart. */
  swatch: string;
  prijs?: number;
  voorraad: number;
  afbeelding?: string;
}

export interface Specificatie {
  label: string;
  waarde: string;
}

export interface Beoordeling {
  id: string;
  naam: string;
  score: number;
  datum: string;
  titel: string;
  tekst: string;
  geverifieerd: boolean;
}

export interface Product {
  id: string;
  slug: string;
  naam: string;
  /** Naam zoals UKM die in de folder schrijft; blijft doorzoekbaar. */
  catalogusnaam: string;
  soort: Productsoort;
  categorie: string;
  subcategorie: string;
  merk: string;
  prijs: number;
  vanPrijs?: number;
  afbeeldingen: string[];
  korteBeschrijving: string;
  beschrijving: string;
  kenmerken: string[];
  specificaties: Specificatie[];
  varianten: Variant[];
  voorraad: number;
  score: number;
  aantalBeoordelingen: number;
  populariteit: number;
  toegevoegdOp: string;
  labels: string[];
  techniek?: Techniek;
  vorm?: Montuurvorm;
  sterktesoort?: Sterktesoort;
  /** Bereik van de dioptrie, bijvoorbeeld "-1.25 tot -8.00". */
  sterktebereik?: string;
  kleurfamilie?: string;
  /** Bronpagina in de PDF-prijslijst; handig bij het bijwerken. */
  bron: string;
}

export interface Categorie {
  slug: string;
  naam: string;
  omschrijving: string;
  soort: Productsoort;
  afbeelding: string;
  /** Wordt bij het opbouwen van de data ingevuld. */
  aantal?: number;
}

export interface Merk {
  slug: string;
  naam: string;
  omschrijving: string;
  herkomst: string;
  /** Korte typering die op de merkkaart komt. */
  positionering: string;
  aantal?: number;
}
