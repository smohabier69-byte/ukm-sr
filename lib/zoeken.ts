import type { Product } from "@/types/product";

/**
 * Zoeken over een Nederlandstalige winkel met Engelse productnamen.
 *
 * UKM schrijft de modellen zoals de leverancier ze levert - "Black Cat Eye",
 * "Ash Grey" - maar klanten typen Nederlands. Zonder vertaalslag levert
 * "zwarte bril" nul resultaten terwijl er tientallen zwarte monturen zijn.
 * Daarom wordt elke zoekterm uitgebreid met bekende synoniemen voordat er
 * gescoord wordt.
 */
const synoniemen: Record<string, string[]> = {
  // Kleuren
  zwart: ["black", "blck"],
  zwarte: ["black", "blck"],
  wit: ["white"],
  witte: ["white"],
  grijs: ["grey", "gray"],
  grijze: ["grey", "gray"],
  bruin: ["brown", "hazel", "coffee", "caramel"],
  bruine: ["brown", "hazel"],
  blauw: ["blue"],
  blauwe: ["blue"],
  groen: ["green"],
  groene: ["green"],
  roze: ["pink", "rose"],
  paars: ["purple", "violet"],
  paarse: ["purple", "violet"],
  goud: ["gold", "gouden"],
  gouden: ["gold"],
  zilver: ["silver", "zilveren"],
  zilveren: ["silver"],
  doorzichtig: ["transparent", "clear", "translucent", "trnsl"],
  transparant: ["transparent", "clear", "translucent", "trnsl"],
  luipaard: ["leopard", "lprd", "cheetah"],
  tijger: ["tigri", "leopard"],

  // Vormen en modellen
  bril: ["glasses", "montuur"],
  brillen: ["glasses"],
  montuur: ["frame", "glasses"],
  monturen: ["frame", "glasses"],
  rond: ["round"],
  ronde: ["round"],
  vierkant: ["square", "sqr"],
  vierkante: ["square", "sqr"],
  rechthoek: ["rectangle"],
  ovaal: ["oval"],
  kat: ["cat"],
  kattenoog: ["cat eye"],
  randloos: ["frameless"],
  dik: ["thick", "thck"],
  dun: ["thin"],
  dunne: ["thin"],
  mat: ["matte"],
  matte: ["matte"],
  glans: ["glossy"],
  glanzend: ["glossy"],
  kind: ["kids", "kinder"],
  kinderen: ["kids"],
  kinderbril: ["kids"],

  // Lenzen en techniek
  lens: ["lenzen", "lens"],
  contactlenzen: ["lenzen", "lens"],
  kleurlenzen: ["lenzen", "lens"],
  sterkte: ["dioptrie"],
  photochroom: ["ptc", "photochromic"],
  fotochroom: ["ptc", "photochromic"],
  meekleurend: ["ptc", "photochromic"],
  zonnebril: ["ptc", "uv"],
  blauwlicht: ["blue light", "bluelight"],
  scherm: ["blue light", "bluelight"],
};

export function normaliseerTekst(waarde: string): string {
  return normaliseer(waarde);
}

function normaliseer(waarde: string): string {
  return waarde
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Splitst de zoekterm en vult hem aan met synoniemen. */
function bouwTermen(zoekterm: string): string[][] {
  return normaliseer(zoekterm)
    .split(" ")
    .filter(Boolean)
    .map((woord) => [woord, ...(synoniemen[woord] ?? [])]);
}

/** Alle doorzoekbare tekst van een product, per gewicht gegroepeerd. */
function velden(product: Product): { tekst: string; gewicht: number }[] {
  return [
    { tekst: normaliseer(product.naam), gewicht: 10 },
    { tekst: normaliseer(product.catalogusnaam), gewicht: 8 },
    { tekst: normaliseer(product.subcategorie), gewicht: 6 },
    { tekst: normaliseer(`${product.categorie} ${product.merk}`), gewicht: 5 },
    { tekst: normaliseer(product.korteBeschrijving), gewicht: 3 },
    { tekst: normaliseer(product.kenmerken.join(" ")), gewicht: 2 },
    {
      tekst: normaliseer(
        `${product.beschrijving} ${product.sterktebereik ?? ""} ${product.kleurfamilie ?? ""} ${product.vorm ?? ""} ${product.techniek ?? ""}`,
      ),
      gewicht: 1,
    },
  ];
}

export interface Zoekresultaat {
  product: Product;
  score: number;
}

/**
 * Scoort producten tegen een zoekterm. Een product telt alleen mee als elk
 * getypt woord ergens voorkomt; anders levert "zwarte cat eye" ook alle
 * zwarte lenzen op.
 */
export function zoekProducten(producten: Product[], zoekterm: string): Zoekresultaat[] {
  const termen = bouwTermen(zoekterm);
  if (termen.length === 0) return producten.map((product) => ({ product, score: 0 }));

  const heleTerm = normaliseer(zoekterm);
  const resultaten: Zoekresultaat[] = [];

  for (const product of producten) {
    const velden_ = velden(product);
    let score = 0;
    let alleTermenGevonden = true;

    for (const varianten of termen) {
      let besteTreffer = 0;

      for (const { tekst, gewicht } of velden_) {
        for (const variant of varianten) {
          const positie = tekst.indexOf(variant);
          if (positie === -1) continue;
          // Een treffer aan het begin van een woord telt zwaarder dan middenin.
          const opWoordgrens = positie === 0 || tekst[positie - 1] === " " || tekst[positie - 1] === "-";
          besteTreffer = Math.max(besteTreffer, gewicht * (opWoordgrens ? 1 : 0.4));
        }
      }

      if (besteTreffer === 0) {
        alleTermenGevonden = false;
        break;
      }
      score += besteTreffer;
    }

    if (!alleTermenGevonden) continue;

    // De volledige zoekzin letterlijk in de naam is het sterkste signaal.
    if (termen.length > 1 && normaliseer(product.naam).includes(heleTerm)) score += 25;
    // Uitverkochte artikelen zakken naar beneden, maar verdwijnen niet.
    if (product.voorraad === 0) score *= 0.55;

    resultaten.push({ product, score });
  }

  return resultaten.sort((a, b) => b.score - a.score || b.product.populariteit - a.product.populariteit);
}

/**
 * Suggesties uit een lichte index, voor het zoekveld in de navigatiebalk.
 * Werkt op een vooraf genormaliseerde tekst, dus zonder de volledige
 * productgegevens naar de browser te sturen.
 */
export function zoekInIndex<T extends { naam: string; zoektekst: string }>(
  index: T[],
  zoekterm: string,
  aantal = 6,
): T[] {
  const termen = bouwTermen(zoekterm);
  if (termen.length === 0 || normaliseer(zoekterm).length < 2) return [];

  const treffers: { item: T; score: number }[] = [];

  for (const item of index) {
    let score = 0;
    let compleet = true;

    for (const varianten of termen) {
      let beste = 0;
      for (const variant of varianten) {
        const positie = item.zoektekst.indexOf(variant);
        if (positie === -1) continue;
        const opWoordgrens = positie === 0 || item.zoektekst[positie - 1] === " ";
        beste = Math.max(beste, opWoordgrens ? 3 : 1);
      }
      if (beste === 0) {
        compleet = false;
        break;
      }
      score += beste;
    }

    if (!compleet) continue;
    if (normaliseer(item.naam).startsWith(normaliseer(zoekterm))) score += 8;
    treffers.push({ item, score });
  }

  return treffers
    .sort((a, b) => b.score - a.score || a.item.naam.localeCompare(b.item.naam, "nl"))
    .slice(0, aantal)
    .map((t) => t.item);
}
