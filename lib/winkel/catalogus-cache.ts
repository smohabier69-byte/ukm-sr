"use client";

import * as React from "react";
import { create } from "zustand";

import type { Categorie, Merk, Product } from "@/types/product";

/**
 * Clientzijdige cache van de live Square-catalogus, voor componenten die niet
 * rechtstreeks een Server Component kunnen `await`-en (winkelwagen,
 * afrekenen, zoeksuggesties in de header). Haalt eenmalig `/api/catalog` op,
 * dat zelf al de servergecachede Square-data serveert - dus geen extra
 * Square-verzoek per bezoeker, wel een client-fetch bij het eerste gebruik.
 */

interface CatalogusData {
  producten: Product[];
  categorieen: Categorie[];
  merken: Merk[];
}

interface CatalogusCacheStaat extends CatalogusData {
  gereed: boolean;
  laadFout: boolean;
}

const useCatalogusCacheStore = create<CatalogusCacheStaat>(() => ({
  producten: [],
  categorieen: [],
  merken: [],
  gereed: false,
  laadFout: false,
}));

let ophalenGestart = false;

function haalCatalogusOp() {
  if (ophalenGestart) return;
  ophalenGestart = true;

  fetch("/api/catalog")
    .then((res) => {
      if (!res.ok) throw new Error(`/api/catalog gaf status ${res.status}`);
      return res.json();
    })
    .then((data: CatalogusData) => {
      useCatalogusCacheStore.setState({ ...data, gereed: true, laadFout: false });
    })
    .catch((err) => {
      console.error("Catalogus ophalen mislukt:", err);
      useCatalogusCacheStore.setState({ gereed: true, laadFout: true });
    });
}

/** Start het ophalen bij het eerste gebruik en geeft de huidige staat terug. */
export function useCatalogusCache(): CatalogusCacheStaat {
  React.useEffect(() => {
    haalCatalogusOp();
  }, []);

  return useCatalogusCacheStore();
}

export function useProductenCache(): { producten: Product[]; gereed: boolean } {
  const { producten, gereed } = useCatalogusCache();
  return { producten, gereed };
}
