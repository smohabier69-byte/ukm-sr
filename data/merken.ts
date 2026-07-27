import type { Merk } from "@/types/product";

/**
 * UKM voert geen externe merken maar eigen huislijnen. De prijslijst deelt het
 * assortiment impliciet al zo in - op techniek en prijsklasse - en die indeling
 * is hier expliciet gemaakt zodat klanten op niveau kunnen filteren.
 */
export const merken: Merk[] = [
  {
    slug: "ukm-signature",
    naam: "UKM Signature",
    omschrijving:
      "De topcollectie: diamantgeslepen monturen, dubbele coating en de meest uitgesproken vormen uit het assortiment. Gemaakt voor wie een bril als sieraad draagt.",
    herkomst: "Huislijn",
    positionering: "Premium photochroom",
  },
  {
    slug: "ukm-ptc",
    naam: "UKM PTC",
    omschrijving:
      "Onze kernlijn met Photochromic Technology Coating. Binnen helder, buiten donker, altijd bescherming tegen UV en blauw licht.",
    herkomst: "Huislijn",
    positionering: "Photochroom, dagelijks",
  },
  {
    slug: "ukm-clear",
    naam: "UKM Clear",
    omschrijving:
      "Heldere anti-blauwlicht brillen zonder kleurverandering. De toegankelijke instap voor iedereen die veel achter een scherm zit.",
    herkomst: "Huislijn",
    positionering: "Anti-blauwlicht",
  },
  {
    slug: "ukm-kids",
    naam: "UKM Kids",
    omschrijving:
      "Lichte, buigzame monturen op kindermaat. Beschermt jonge ogen tijdens huiswerk, tablet en televisie.",
    herkomst: "Huislijn",
    positionering: "Kinderbrillen",
  },
  {
    slug: "ukm-vision",
    naam: "UKM Vision",
    omschrijving:
      "Kleurlenzen op sterkte, van -1.00 tot -8.00. Corrigeren en verkleuren in een enkele lens, zodat een bril niet altijd nodig is.",
    herkomst: "Huislijn",
    positionering: "Kleurlenzen op sterkte",
  },
  {
    slug: "ukm-soft-lenses",
    naam: "UKM Soft Lenses",
    omschrijving:
      "Zachte kleurlenzen zonder sterkte, in ruim dertig tinten. FDA, GMP, ISO en CE goedgekeurd en zes maanden houdbaar.",
    herkomst: "Huislijn",
    positionering: "Kleurlenzen zonder sterkte",
  },
];

export function merkOpSlug(slug: string): Merk | undefined {
  return merken.find((m) => m.slug === slug);
}
