import type { Product } from "@/types/product";
import { brillenInvoer, type BrilInvoer } from "./catalogus/brillen";
import { lenzenInvoer, type LensInvoer } from "./catalogus/lenzen";
import {
  brilKenmerkenBasis,
  brilSpecificaties,
  kleurprofielen,
  lensKenmerken,
  lensSpecificaties,
  techniekprofielen,
  toegevoegdOp,
  tussen,
  vormprofielen,
} from "./catalogus/gemeenschappelijk";

const PEILDATUM = new Date("2026-04-01T00:00:00Z");
const NIEUW_BINNEN_DAGEN = 120;

function isNieuw(datum: string): boolean {
  return (PEILDATUM.getTime() - new Date(datum).getTime()) / 86_400_000 <= NIEUW_BINNEN_DAGEN;
}

/** Huislijn volgt uit techniek en prijsklasse; zo blijft de indeling consistent. */
function brilMerk(invoer: BrilInvoer): string {
  if (invoer.vorm === "kids") return "ukm-kids";
  if (invoer.techniek !== "ptc") return "ukm-clear";
  return invoer.prijs >= 750 ? "ukm-signature" : "ukm-ptc";
}

function gedeeldeVelden(slug: string, labels: string[] = []) {
  const datum = toegevoegdOp(slug);
  const voorraad = tussen(slug, "voorraad", 0, 38);
  const basisPopulariteit = tussen(slug, "populariteit", 12, 88);

  const afgeleid = [...labels];
  if (isNieuw(datum) && !afgeleid.includes("nieuw")) afgeleid.push("nieuw");
  if (voorraad === 0) afgeleid.push("uitverkocht");
  else if (voorraad <= 4) afgeleid.push("bijna-uitverkocht");

  return {
    voorraad,
    populariteit: labels.includes("bestseller") ? Math.min(100, basisPopulariteit + 20) : basisPopulariteit,
    toegevoegdOp: datum,
    labels: afgeleid,
  };
}

function maakBril(invoer: BrilInvoer): Product {
  const vorm = vormprofielen[invoer.vorm];
  const techniek = techniekprofielen[invoer.techniek];

  const beschrijving = [
    `De ${invoer.naam} is uitgevoerd in ${invoer.kleur.toLowerCase()}, op een montuur van ${invoer.materiaal.toLowerCase()}.`,
    vorm.karakter,
    techniek.tekst,
    vorm.pasvorm,
  ].join(" ");

  return {
    id: `bril-${invoer.slug}`,
    slug: invoer.slug,
    naam: invoer.naam,
    catalogusnaam: invoer.catalogusnaam,
    soort: "bril",
    categorie:
      invoer.vorm === "kids" ? "kinderbrillen" : invoer.techniek === "ptc" ? "ptc" : "anti-blauwlicht",
    subcategorie: vorm.naam,
    merk: brilMerk(invoer),
    prijs: invoer.prijs,
    vanPrijs: invoer.vanPrijs,
    afbeeldingen: invoer.afbeeldingen,
    korteBeschrijving: invoer.intro,
    beschrijving,
    kenmerken: [...techniek.kenmerken, ...brilKenmerkenBasis],
    specificaties: brilSpecificaties({
      vorm: invoer.vorm,
      techniek: invoer.techniek,
      materiaal: invoer.materiaal,
      slug: invoer.slug,
    }),
    varianten: (invoer.varianten ?? []).map((v, i) => ({
      ...v,
      voorraad: tussen(invoer.slug, `variant-${v.id}`, i === 0 ? 3 : 0, 22),
      afbeelding: invoer.afbeeldingen[Math.min(i, invoer.afbeeldingen.length - 1)],
    })),
    techniek: invoer.techniek,
    vorm: invoer.vorm,
    bron: `Brillen prijslijst, pagina ${invoer.pagina}`,
    ...gedeeldeVelden(invoer.slug, invoer.labels),
  };
}

function maakLens(invoer: LensInvoer): Product {
  const kleur = kleurprofielen[invoer.kleur];
  const opSterkte = invoer.sterktesoort === "met-sterkte";

  const beschrijving = [
    `${invoer.naam}${invoer.code ? ` (${invoer.code})` : ""} is een zachte kleurlens ${
      opSterkte
        ? `die corrigeert en verkleurt in een enkele lens, leverbaar in sterkte ${invoer.sterktebereik.toLowerCase()}`
        : "zonder sterkte, puur bedoeld om de oogkleur te veranderen"
    }.`,
    kleur.tekst,
    "Een set bestaat uit twee lenzen in steriele vloeistof, na openen zes maanden houdbaar. Het materiaal bevat 38 tot 42 procent water, waardoor de lens de hele dag soepel blijft.",
    "Draag lenzen nooit langer dan aanbevolen en volg de hygieneregels die bij elke bestelling worden meegeleverd.",
  ].join(" ");

  return {
    id: `lens-${invoer.slug}`,
    slug: invoer.slug,
    naam: invoer.naam,
    catalogusnaam: invoer.catalogusnaam,
    soort: "lens",
    categorie: opSterkte ? "lenzen-met-sterkte" : "lenzen-zonder-sterkte",
    subcategorie: kleur.familie,
    merk: opSterkte ? "ukm-vision" : "ukm-soft-lenses",
    prijs: invoer.prijs,
    vanPrijs: invoer.vanPrijs,
    afbeeldingen: invoer.afbeeldingen,
    korteBeschrijving: invoer.intro,
    beschrijving,
    kenmerken: [
      opSterkte ? `Leverbaar op sterkte ${invoer.sterktebereik.toLowerCase()}` : "Zonder sterkte, voor iedereen",
      ...lensKenmerken,
    ],
    specificaties: lensSpecificaties({ sterkte: invoer.sterktebereik, slug: invoer.slug }),
    varianten: [],
    sterktesoort: invoer.sterktesoort,
    sterktebereik: invoer.sterktebereik,
    // De slug, niet het label: filters en URL's werken overal met kleine letters.
    kleurfamilie: invoer.kleur,
    bron: `Lenzen prijslijst, pagina ${invoer.pagina}`,
    ...gedeeldeVelden(invoer.slug, invoer.labels),
  };
}

export const producten: Product[] = [...brillenInvoer.map(maakBril), ...lenzenInvoer.map(maakLens)];

/* -------------------------------------------------------------------------- */
/* Selecties                                                                   */
/* -------------------------------------------------------------------------- */

const opVoorraad = (p: Product) => p.voorraad > 0;

export function productOpSlug(slug: string): Product | undefined {
  return producten.find((p) => p.slug === slug);
}

export function productenInCategorie(categorie: string): Product[] {
  return producten.filter((p) => p.categorie === categorie);
}

export function productenVanMerk(merk: string): Product[] {
  return producten.filter((p) => p.merk === merk);
}

export const bestsellers = [...producten]
  .filter(opVoorraad)
  .sort((a, b) => b.populariteit - a.populariteit)
  .slice(0, 8);

export const aanbiedingen = producten.filter((p) => p.vanPrijs && p.vanPrijs > p.prijs);

/**
 * Uitgelicht op de homepagina: een doorsnede van het assortiment in plaats van
 * acht keer hetzelfde model, zodat de breedte van de collectie meteen zichtbaar is.
 */
export const uitgelicht = (() => {
  const gekozen: Product[] = [];
  const gezien = new Set<string>();
  for (const p of [...producten].filter(opVoorraad).sort((a, b) => b.populariteit - a.populariteit)) {
    const sleutel = `${p.categorie}:${p.subcategorie}`;
    if (gezien.has(sleutel)) continue;
    gezien.add(sleutel);
    gekozen.push(p);
    if (gekozen.length === 8) break;
  }
  return gekozen;
})();

/** Trending: nieuw binnen en toch al goed bezocht, in plaats van simpelweg de bestsellers. */
export const trending = [...producten]
  .filter(opVoorraad)
  .sort((a, b) => {
    const gewichtB = b.populariteit + (b.labels.includes("nieuw") ? 20 : 0);
    const gewichtA = a.populariteit + (a.labels.includes("nieuw") ? 20 : 0);
    return gewichtB - gewichtA;
  })
  .slice(0, 8);

export const nieuwBinnen = [...producten]
  .filter(opVoorraad)
  .filter((p) => p.labels.includes("nieuw"))
  .sort((a, b) => b.toegevoegdOp.localeCompare(a.toegevoegdOp))
  .slice(0, 8);

/** Aantal artikelen per categorie, voor de categoriekaarten. */
export function aantalPerCategorie(): Record<string, number> {
  return producten.reduce<Record<string, number>>((acc, p) => {
    acc[p.categorie] = (acc[p.categorie] ?? 0) + 1;
    return acc;
  }, {});
}

export function aantalPerMerk(): Record<string, number> {
  return producten.reduce<Record<string, number>>((acc, p) => {
    acc[p.merk] = (acc[p.merk] ?? 0) + 1;
    return acc;
  }, {});
}

export const prijsbereik = {
  min: Math.min(...producten.map((p) => p.prijs)),
  max: Math.max(...producten.map((p) => p.prijs)),
};

/**
 * Vaak samen gekocht. Bij een bril hoort in de praktijk vaak een set lenzen en
 * andersom, dus de suggestie pakt bewust iets uit de andere productsoort plus
 * een tweede model uit dezelfde categorie. De keuze is deterministisch, zodat
 * het blok bij elk bezoek hetzelfde toont.
 */
export function vaakSamenGekocht(product: Product): Product[] {
  const beschikbaar = producten.filter((p) => p.slug !== product.slug && p.voorraad > 0);
  const andereSoort = beschikbaar
    .filter((p) => p.soort !== product.soort)
    .sort((a, b) => b.populariteit - a.populariteit);
  const zelfdeCategorie = beschikbaar
    .filter((p) => p.categorie === product.categorie)
    .sort((a, b) => b.populariteit - a.populariteit);

  const keuzes: Product[] = [];
  const index = tussen(product.slug, "combinatie", 0, 3);
  if (andereSoort.length) keuzes.push(andereSoort[index % andereSoort.length]);
  if (zelfdeCategorie.length) keuzes.push(zelfdeCategorie[index % zelfdeCategorie.length]);

  return keuzes.filter((p, i, lijst) => lijst.findIndex((q) => q.slug === p.slug) === i);
}

/** Gerelateerde artikelen: zelfde categorie, anders zelfde merk. */
export function gerelateerdeProducten(product: Product, aantal = 4): Product[] {
  const zelfdeCategorie = producten.filter((p) => p.categorie === product.categorie && p.slug !== product.slug);
  const rest = producten.filter((p) => p.merk === product.merk && p.categorie !== product.categorie);
  return [...zelfdeCategorie, ...rest].slice(0, aantal);
}
