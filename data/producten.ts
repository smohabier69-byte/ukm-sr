import type { Product } from "@/types/product";
import { brillenInvoer, type BrilInvoer } from "./catalogus/brillen";
import { lenzenInvoer, type LensInvoer } from "./catalogus/lenzen";
import {
  CATALOGUSDATUM,
  VORIGE_UITGAVE,
  brilSpecificaties,
  kleurprofielen,
  lensKenmerken,
  lensSpecificaties,
  techniekprofielen,
  vormprofielen,
} from "./catalogus/gemeenschappelijk";
import { metStudiofotos, studiofotoVariant } from "./catalogus/studiofotos";

/**
 * Het assortiment uit de prijslijsten van november 2026, als kant-en-klare
 * `Product`-objecten.
 *
 * Dit is de terugvalbron voor lib/square/catalog.server.ts: zolang de
 * gekoppelde Square-account geen artikelen bevat, draait de winkel hierop.
 * Dezelfde invoer voedt scripts/square-catalog-sync.ts, dat het assortiment
 * naar Square schrijft.
 */

/**
 * De prijslijst noemt geen aantallen, alleen "Sold out". Net als bij
 * Square-variaties zonder voorraadtelling is een artikel dus bestelbaar
 * (geen verzonnen aantal) of uitverkocht.
 */
const BESTELBAAR = 999;

function labelsEnVolgorde(labels: string[] = [], uitverkocht: boolean) {
  const nieuw = labels.includes("nieuw");
  const alle = [...labels];
  if (uitverkocht) alle.push("uitverkocht");
  return {
    labels: alle,
    populariteit: labels.includes("bestseller") ? 100 : nieuw ? 70 : 50,
    toegevoegdOp: nieuw ? CATALOGUSDATUM : VORIGE_UITGAVE,
  };
}

function brilCategorie(invoer: BrilInvoer): string {
  if (invoer.lijn === "lees") return "leesbrillen";
  if (invoer.lijn === "heren") return "heren-unisex";
  return invoer.techniek === "non-ptc" ? "anti-blauwlicht" : "ptc";
}

/** Huislijn volgt uit de prijslijst waarin het model staat en de techniek. */
function brilMerk(invoer: BrilInvoer): string {
  if (invoer.lijn === "lees") return "ukm-readers";
  if (invoer.lijn === "heren") return "ukm-men";
  return invoer.techniek === "non-ptc" ? "ukm-clear" : "ukm-ptc";
}

function maakBril(invoer: BrilInvoer): Product {
  const vorm = vormprofielen[invoer.vorm];
  const techniek = techniekprofielen[invoer.techniek];
  const isLeesbril = invoer.lijn === "lees";

  const varianten = (invoer.varianten ?? []).map((v) => ({
    id: v.id,
    naam: v.naam,
    swatch: v.swatch,
    voorraad: v.uitverkocht ? 0 : BESTELBAAR,
    afbeelding: studiofotoVariant(invoer.slug, v.id) ?? v.afbeelding,
  }));
  const voorraad = varianten.length
    ? varianten.reduce((totaal, v) => totaal + v.voorraad, 0)
    : invoer.uitverkocht
      ? 0
      : BESTELBAAR;

  const beschrijving = [
    `${invoer.naam}: ${invoer.kleur.charAt(0).toLowerCase()}${invoer.kleur.slice(1)}.`,
    vorm.karakter,
    isLeesbril
      ? `Een leesbril met blauwlichtfilter, leverbaar in de sterktes ${invoer.sterktes}.`
      : "",
    techniek.tekst,
    vorm.pasvorm,
  ]
    .filter(Boolean)
    .join(" ");

  return {
    id: `bril-${invoer.slug}`,
    slug: invoer.slug,
    naam: invoer.naam,
    catalogusnaam: invoer.catalogusnaam,
    soort: "bril",
    categorie: brilCategorie(invoer),
    subcategorie: vorm.naam,
    merk: brilMerk(invoer),
    prijs: invoer.prijs,
    vanPrijs: invoer.vanPrijs,
    afbeeldingen: metStudiofotos(invoer.slug, invoer.afbeeldingen),
    korteBeschrijving: invoer.intro,
    beschrijving,
    kenmerken: [
      ...(isLeesbril ? [`Leesbril in ${invoer.sterktes}`] : []),
      ...techniek.kenmerken,
      ...(varianten.length > 1 ? [`Leverbaar in ${varianten.length} kleuren`] : []),
    ],
    specificaties: brilSpecificaties({
      vorm: invoer.vorm,
      techniek: invoer.techniek,
      kleur: invoer.kleur,
      sterktes: invoer.sterktes,
    }),
    varianten,
    voorraad,
    techniek: invoer.techniek,
    vorm: invoer.vorm,
    sterktebereik: invoer.sterktes,
    bron: `Prijslijst november 2026, pagina ${invoer.pagina}`,
    ...labelsEnVolgorde(invoer.labels, voorraad === 0),
  };
}

function maakLens(invoer: LensInvoer): Product {
  const kleur = kleurprofielen[invoer.kleur];
  const opSterkte = invoer.sterktesoort === "met-sterkte";
  const eenSterkte = invoer.sterktebereik.startsWith("Alleen");
  const sterkteTekst = invoer.sterktebereik.toLowerCase();

  const beschrijving = [
    `${invoer.naam}${invoer.code ? ` (${invoer.code})` : ""} is een zachte kleurlens ${
      opSterkte
        ? eenSterkte
          ? `op sterkte, ${sterkteTekst} leverbaar`
          : `die corrigeert en verkleurt in een enkele lens, leverbaar in sterkte ${sterkteTekst}`
        : "zonder sterkte, puur bedoeld om de oogkleur te veranderen"
    }.`,
    kleur.tekst,
    "De lenzen zijn zes maanden houdbaar en bevatten 38 tot 42 procent water, waardoor ze soepel blijven.",
    "Draag lenzen nooit langer dan aanbevolen, slaap er niet mee en volg de hygieneregels die bij elke bestelling horen.",
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
    afbeeldingen: metStudiofotos(invoer.slug, invoer.afbeeldingen),
    korteBeschrijving: invoer.intro,
    beschrijving,
    kenmerken: [
      opSterkte
        ? eenSterkte
          ? `Op sterkte: ${sterkteTekst}`
          : `Leverbaar op sterkte ${sterkteTekst}`
        : "Zonder sterkte, voor iedereen",
      ...lensKenmerken,
    ],
    specificaties: lensSpecificaties({ sterkte: invoer.sterktebereik, code: invoer.code }),
    varianten: [],
    voorraad: invoer.uitverkocht ? 0 : BESTELBAAR,
    sterktesoort: invoer.sterktesoort,
    sterktebereik: invoer.sterktebereik,
    // De slug, niet het label: filters en URL's werken overal met kleine letters.
    kleurfamilie: invoer.kleur,
    bron: `Lenzen prijslijst november 2026, pagina ${invoer.pagina}`,
    ...labelsEnVolgorde(invoer.labels, !!invoer.uitverkocht),
  };
}

export const producten: Product[] = [...brillenInvoer.map(maakBril), ...lenzenInvoer.map(maakLens)];
