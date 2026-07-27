import { bedrijf } from "@/lib/site";
import { productOpSlug } from "@/data/producten";
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

/** Demonstratiecodes. Een echte winkel haalt deze uit de administratie. */
export const kortingscodes: Kortingscode[] = [
  { code: "WELKOM10", omschrijving: "10% korting op je eerste bestelling", soort: "percentage", waarde: 10 },
  { code: "UKM50", omschrijving: "SRD 50,- korting vanaf SRD 500,-", soort: "bedrag", waarde: 50, vanaf: 500 },
  { code: "GRATISBEZORGING", omschrijving: "Gratis bezorging in Paramaribo", soort: "bezorging", waarde: 0 },
];

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

/** Koppelt opgeslagen regels aan de actuele catalogus; onbekende slugs vallen weg. */
export function bouwPosten(regels: Winkelwagenregel[]): Winkelwagenpost[] {
  const posten: Winkelwagenpost[] = [];

  for (const regel of regels) {
    const product = productOpSlug(regel.slug);
    if (!product) continue;

    const variant = regel.variantId ? product.varianten.find((v) => v.id === regel.variantId) : undefined;
    const stukprijs = variant?.prijs ?? product.prijs;
    posten.push({ regel, product, variant, stukprijs, totaal: stukprijs * regel.aantal });
  }

  return posten;
}

export interface Kostenoverzicht {
  subtotaal: number;
  korting: number;
  bezorgkosten: number;
  /** BTW die al in de prijzen zit, puur ter informatie. */
  btwAandeel: number;
  totaal: number;
  gratisBezorging: boolean;
  /** Wat er nog besteed moet worden voor gratis bezorging. */
  tekortVoorGratis: number;
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
export function berekenKosten(posten: Winkelwagenpost[], kortingscode: string | null): Kostenoverzicht {
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
  const haaltDrempel = naKorting >= bedrijf.gratisBezorgingVanaf;
  const gratisBezorging = posten.length === 0 || haaltDrempel || bezorgingGratisViaCode;
  const bezorgkosten = gratisBezorging ? 0 : bedrijf.bezorgingVanaf;

  const totaal = naKorting + bezorgkosten;
  const btwAandeel = Math.round((totaal * bedrijf.btwTarief) / (1 + bedrijf.btwTarief));

  return {
    subtotaal,
    korting,
    bezorgkosten,
    btwAandeel,
    totaal,
    gratisBezorging,
    tekortVoorGratis: Math.max(0, bedrijf.gratisBezorgingVanaf - naKorting),
  };
}
