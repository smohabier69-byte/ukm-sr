import "server-only";
import type { Product } from "@/types/product";
import { catalogus } from "./catalog.server";

/**
 * Async vervanging van data/producten.ts, zelfde functienamen, nu gevoed
 * door de live Square-catalogus (lib/square/catalog.server.ts) in plaats van
 * een statische array.
 */

export async function alleProducten(): Promise<Product[]> {
  return (await catalogus()).producten;
}

export async function productOpSlug(slug: string): Promise<Product | undefined> {
  return (await alleProducten()).find((p) => p.slug === slug);
}

export async function productenInCategorie(categorie: string): Promise<Product[]> {
  return (await alleProducten()).filter((p) => p.categorie === categorie);
}

export async function productenVanMerk(merk: string): Promise<Product[]> {
  return (await alleProducten()).filter((p) => p.merk === merk);
}

const opVoorraad = (p: Product) => p.voorraad > 0;

/**
 * Sommige lenzen bestaan twee keer: zonder en met sterkte, met dezelfde naam
 * en vaak dezelfde foto. In een rij op de homepagina of onder een product
 * leest dat als een dubbel artikel, dus selecties houden per naam het eerste
 * exemplaar (de lijst is dan al gesorteerd op relevantie).
 */
function eenPerNaam(producten: Product[]): Product[] {
  const gezien = new Set<string>();
  return producten.filter((p) => {
    const sleutel = p.naam.trim().toLowerCase();
    if (gezien.has(sleutel)) return false;
    gezien.add(sleutel);
    return true;
  });
}

export async function bestsellers(): Promise<Product[]> {
  const producten = await alleProducten();
  return eenPerNaam([...producten].filter(opVoorraad).sort((a, b) => b.populariteit - a.populariteit)).slice(0, 8);
}

export async function aanbiedingen(): Promise<Product[]> {
  const producten = await alleProducten();
  return producten.filter((p) => p.vanPrijs && p.vanPrijs > p.prijs);
}

/**
 * Uitgelicht op de homepagina: een doorsnede van het assortiment. Namen in
 * `uitsluiten` (bijvoorbeeld wat al bij "Nieuw binnen" staat) worden
 * overgeslagen, zodat twee rijen onder elkaar niet hetzelfde tonen.
 */
export async function uitgelicht(uitsluiten: string[] = [], soort?: Product["soort"]): Promise<Product[]> {
  const producten = (await alleProducten()).filter(
    (p) => !uitsluiten.includes(p.naam) && (!soort || p.soort === soort),
  );
  const gekozen: Product[] = [];
  const gezien = new Set<string>();
  for (const p of eenPerNaam([...producten].filter(opVoorraad).sort((a, b) => b.populariteit - a.populariteit))) {
    const sleutel = `${p.categorie}:${p.subcategorie}`;
    if (gezien.has(sleutel)) continue;
    gezien.add(sleutel);
    gekozen.push(p);
    if (gekozen.length === 8) break;
  }
  return gekozen;
}

export async function trending(): Promise<Product[]> {
  const producten = await alleProducten();
  return eenPerNaam(
    [...producten].filter(opVoorraad).sort((a, b) => {
      const gewichtB = b.populariteit + (b.labels.includes("nieuw") ? 20 : 0);
      const gewichtA = a.populariteit + (a.labels.includes("nieuw") ? 20 : 0);
      return gewichtB - gewichtA;
    }),
  ).slice(0, 8);
}

/**
 * Nieuw binnen, om en om per collectie. Een nieuwe uitgave van de prijslijst
 * brengt in een keer tientallen modellen met dezelfde datum; puur op datum
 * sorteren zou dan acht keer dezelfde collectie tonen.
 */
export async function nieuwBinnen(soort?: Product["soort"]): Promise<Product[]> {
  const producten = (await alleProducten()).filter((p) => !soort || p.soort === soort);
  const nieuw = eenPerNaam(
    [...producten]
      .filter(opVoorraad)
      .filter((p) => p.labels.includes("nieuw"))
      .sort((a, b) => b.toegevoegdOp.localeCompare(a.toegevoegdOp)),
  );

  const perCategorie = new Map<string, Product[]>();
  for (const p of nieuw) perCategorie.set(p.categorie, [...(perCategorie.get(p.categorie) ?? []), p]);

  const gekozen: Product[] = [];
  const rijen = [...perCategorie.values()];
  for (let ronde = 0; gekozen.length < 8 && rijen.some((rij) => rij.length > ronde); ronde++) {
    for (const rij of rijen) {
      if (rij[ronde] && gekozen.length < 8) gekozen.push(rij[ronde]);
    }
  }
  return gekozen;
}

export async function aantalPerCategorie(): Promise<Record<string, number>> {
  const producten = await alleProducten();
  return producten.reduce<Record<string, number>>((acc, p) => {
    acc[p.categorie] = (acc[p.categorie] ?? 0) + 1;
    return acc;
  }, {});
}

export async function aantalPerMerk(): Promise<Record<string, number>> {
  const producten = await alleProducten();
  return producten.reduce<Record<string, number>>((acc, p) => {
    acc[p.merk] = (acc[p.merk] ?? 0) + 1;
    return acc;
  }, {});
}

export async function prijsbereik(): Promise<{ min: number; max: number }> {
  const producten = await alleProducten();
  if (producten.length === 0) return { min: 0, max: 0 };
  return {
    min: Math.min(...producten.map((p) => p.prijs)),
    max: Math.max(...producten.map((p) => p.prijs)),
  };
}

/** Vaak samen gekocht: bewust iets uit de andere productsoort plus een tweede model uit dezelfde categorie. */
export async function vaakSamenGekocht(product: Product): Promise<Product[]> {
  const producten = await alleProducten();
  const beschikbaar = producten.filter((p) => p.naam !== product.naam && p.voorraad > 0);
  const andereSoort = beschikbaar.filter((p) => p.soort !== product.soort).sort((a, b) => b.populariteit - a.populariteit);
  const zelfdeCategorie = beschikbaar
    .filter((p) => p.categorie === product.categorie)
    .sort((a, b) => b.populariteit - a.populariteit);

  const keuzes: Product[] = [];
  // Deterministisch op basis van de slug, zodat het blok bij elk bezoek hetzelfde toont.
  let h = 2166136261;
  for (let i = 0; i < product.slug.length; i++) {
    h ^= product.slug.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const index = (h >>> 0) % 3;
  if (andereSoort.length) keuzes.push(andereSoort[index % andereSoort.length]);
  if (zelfdeCategorie.length) keuzes.push(zelfdeCategorie[index % zelfdeCategorie.length]);

  return keuzes.filter((p, i, lijst) => lijst.findIndex((q) => q.slug === p.slug) === i);
}

export async function gerelateerdeProducten(product: Product, aantal = 4): Promise<Product[]> {
  const producten = await alleProducten();
  // Dezelfde lens met of zonder sterkte is geen "vergelijkbaar model" maar hetzelfde.
  const anders = producten.filter((p) => p.naam !== product.naam);
  const zelfdeCategorie = anders.filter((p) => p.categorie === product.categorie);
  const rest = anders.filter((p) => p.merk === product.merk && p.categorie !== product.categorie);
  return eenPerNaam([...zelfdeCategorie, ...rest]).slice(0, aantal);
}
