import { bedrijf } from "@/lib/site";
import type { Product, Variant } from "@/types/product";
import type { Winkelwagenregel } from "./stores";

export interface Kortingscode {
  code: string;
  omschrijving: string;
  soort: "percentage" | "bedrag" | "bezorging";
  waarde: number;
  /** Minimale bestelwaarde waarboven de code geldig is. */
  vanaf?: number;
}

/**
 * Geldige kortingscodes. Leeg: de vroegere demonstratiecodes (WELKOM10,
 * UKM50, GRATISBEZORGING) gaven korting die UKM nooit heeft aangeboden. Voeg
 * hier een echte code toe als UKM een actie start; het kortingscodeveld in de
 * winkelwagen verschijnt dan vanzelf.
 */
export const kortingscodes: Kortingscode[] = [];

export function zoekKortingscode(code: string): Kortingscode | undefined {
  return kortingscodes.find((k) => k.code === code.trim().toUpperCase());
}

export interface Winkelwagenpost {
  regel: Winkelwagenregel;
  product: Product;
  variant?: Variant;
  stukprijs: number;
  totaal: number;
}

/**
 * Koppelt opgeslagen regels aan de actuele catalogus; onbekende slugs vallen
 * weg. Neemt de productenlijst als parameter aan (i.p.v. zelf op te halen),
 * zodat deze functie puur blijft - clientcomponenten leveren de lijst uit
 * `useCatalogusCache()` (lib/winkel/catalogus-cache.ts).
 */
export function bouwPosten(regels: Winkelwagenregel[], producten: Product[]): Winkelwagenpost[] {
  const posten: Winkelwagenpost[] = [];

  for (const regel of regels) {
    const product = producten.find((p) => p.slug === regel.slug);
    if (!product) continue;

    const variant = regel.variantId ? product.varianten.find((v) => v.id === regel.variantId) : undefined;
    const stukprijs = variant?.prijs ?? product.prijs;
    posten.push({ regel, product, variant, stukprijs, totaal: stukprijs * regel.aantal });
  }

  return posten;
}

export type Bezorgwijze = "bezorgen" | "afhalen";

export interface Kostenoverzicht {
  subtotaal: number;
  korting: number;
  /** Bij bezorgen het minimumbedrag; extra kilometers komen erbij. */
  bezorgkosten: number;
  /** True bij bezorgen: bezorgkosten en totaal zijn een "vanaf"-bedrag. */
  bezorgingVanaf: boolean;
  /** BTW die al in de prijzen zit, puur ter informatie. */
  btwAandeel: number;
  totaal: number;
}

/**
 * Berekent de kosten.
 *
 * De prijzen in de prijslijst van UKM zijn winkelprijzen inclusief BTW, zoals
 * gebruikelijk in de Surinaamse detailhandel. De BTW wordt daarom niet bovenop
 * het totaal geteld maar eruit gelicht: het bedrag dat al in de prijs zit.
 * Er tien procent bij optellen zou de artikelen duurder maken dan ze in de
 * winkel zijn.
 */
export function berekenKosten(
  posten: Winkelwagenpost[],
  kortingscode: string | null,
  bezorgwijze: Bezorgwijze = "bezorgen",
): Kostenoverzicht {
  const subtotaal = posten.reduce((som, post) => som + post.totaal, 0);

  let korting = 0;
  let bezorgingGratisViaCode = false;

  const code = kortingscode ? zoekKortingscode(kortingscode) : undefined;
  if (code && subtotaal >= (code.vanaf ?? 0)) {
    if (code.soort === "percentage") korting = Math.round((subtotaal * code.waarde) / 100);
    else if (code.soort === "bedrag") korting = Math.min(code.waarde, subtotaal);
    else bezorgingGratisViaCode = true;
  }

  const naKorting = Math.max(0, subtotaal - korting);
  // Bezorgen kost minimaal bedrijf.bezorgingVanaf; extra kilometers rekent UKM na via WhatsApp.
  const bezorgen = bezorgwijze === "bezorgen" && posten.length > 0 && !bezorgingGratisViaCode;
  const bezorgkosten = bezorgen ? bedrijf.bezorgingVanaf : 0;

  const totaal = naKorting + bezorgkosten;
  const btwAandeel = Math.round((totaal * bedrijf.btwTarief) / (1 + bedrijf.btwTarief));

  return { subtotaal, korting, bezorgkosten, bezorgingVanaf: bezorgen, btwAandeel, totaal };
}
