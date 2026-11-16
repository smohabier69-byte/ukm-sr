import type { Merk } from "@/types/product";

/**
 * UKM voert geen externe merken maar eigen huislijnen. De prijslijsten delen
 * het assortiment al zo in - per uitgave en per techniek - en die indeling is
 * hier expliciet gemaakt zodat klanten per lijn kunnen bladeren.
 */
export const merken: Merk[] = [
  {
    slug: "ukm-ptc",
    naam: "UKM PTC",
    omschrijving:
      "Onze kernlijn met Photochromic Technology Coating. Binnen helder, buiten donker, altijd bescherming tegen UV en blauw licht.",
    herkomst: "Huislijn",
    positionering: "Photochroom",
  },
  {
    slug: "ukm-clear",
    naam: "UKM Clear",
    omschrijving:
      "Heldere anti-blauwlicht brillen zonder kleurverandering. Voor iedereen die veel achter een scherm zit.",
    herkomst: "Huislijn",
    positionering: "Anti-blauwlicht",
  },
  {
    slug: "ukm-readers",
    naam: "UKM Readers",
    omschrijving:
      "Leesbrillen met blauwlichtfilter in +1.5, +2.0, +2.5 en +3.0. Van randloos en onopvallend tot uitgesproken cat eye.",
    herkomst: "Huislijn",
    positionering: "Leesbrillen",
  },
  {
    slug: "ukm-men",
    naam: "UKM Men & Unisex",
    omschrijving:
      "PTC-monturen voor hem en voor iedereen: randloze zeshoeken, strakke vierkante monturen, de sportbril en de Night Vision-rijbril met geel glas.",
    herkomst: "Huislijn",
    positionering: "Heren en unisex",
  },
  {
    slug: "ukm-soft-lenses",
    naam: "UKM Soft Lenses",
    omschrijving:
      "Zachte kleurlenzen zonder sterkte, in dertig tinten. FDA, GMP, ISO en CE goedgekeurd en zes maanden houdbaar.",
    herkomst: "Huislijn",
    positionering: "Kleurlenzen zonder sterkte",
  },
  {
    slug: "ukm-vision",
    naam: "UKM Vision",
    omschrijving:
      "Kleurlenzen op sterkte, van -1.00 tot -8.00. Corrigeren en verkleuren in een enkele lens, zodat een bril niet altijd nodig is.",
    herkomst: "Huislijn",
    positionering: "Kleurlenzen op sterkte",
  },
];

export function merkOpSlug(slug: string): Merk | undefined {
  return merken.find((m) => m.slug === slug);
}
