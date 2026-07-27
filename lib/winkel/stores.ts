"use client";

import * as React from "react";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * Winkelwagen, verlanglijst en recent bekeken.
 *
 * In de opslag staan alleen slugs en aantallen, nooit prijzen of omschrijvingen.
 * De productgegevens komen bij het renderen uit de catalogus, zodat een
 * winkelwagen die een week in de browser stond niet ineens verouderde prijzen
 * toont wanneer de prijslijst is bijgewerkt.
 *
 * Alle drie de stores slaan de automatische hydratie over. Next rendert op de
 * server namelijk een lege winkelwagen; zou de browser meteen uit localStorage
 * vullen, dan wijkt de eerste render af van de HTML en klaagt React. Daarom
 * gebeurt het hydrateren expliciet, na de eerste render.
 */

export interface Winkelwagenregel {
  slug: string;
  /** Leeg wanneer het product geen varianten heeft. */
  variantId?: string;
  aantal: number;
}

const MAX_PER_REGEL = 10;

function sleutelVan(slug: string, variantId?: string) {
  return `${slug}::${variantId ?? ""}`;
}

interface WinkelwagenStore {
  regels: Winkelwagenregel[];
  kortingscode: string | null;
  voegToe: (slug: string, aantal?: number, variantId?: string) => void;
  wijzigAantal: (slug: string, aantal: number, variantId?: string) => void;
  verwijder: (slug: string, variantId?: string) => void;
  leegmaken: () => void;
  zetKortingscode: (code: string | null) => void;
}

export const useWinkelwagen = create<WinkelwagenStore>()(
  persist(
    (set) => ({
      regels: [],
      kortingscode: null,

      voegToe: (slug, aantal = 1, variantId) =>
        set((staat) => {
          const sleutel = sleutelVan(slug, variantId);
          const bestaand = staat.regels.find((r) => sleutelVan(r.slug, r.variantId) === sleutel);
          if (bestaand) {
            return {
              regels: staat.regels.map((r) =>
                sleutelVan(r.slug, r.variantId) === sleutel
                  ? { ...r, aantal: Math.min(MAX_PER_REGEL, r.aantal + aantal) }
                  : r,
              ),
            };
          }
          return { regels: [...staat.regels, { slug, variantId, aantal: Math.min(MAX_PER_REGEL, aantal) }] };
        }),

      wijzigAantal: (slug, aantal, variantId) =>
        set((staat) => {
          const sleutel = sleutelVan(slug, variantId);
          if (aantal < 1) {
            return { regels: staat.regels.filter((r) => sleutelVan(r.slug, r.variantId) !== sleutel) };
          }
          return {
            regels: staat.regels.map((r) =>
              sleutelVan(r.slug, r.variantId) === sleutel
                ? { ...r, aantal: Math.min(MAX_PER_REGEL, aantal) }
                : r,
            ),
          };
        }),

      verwijder: (slug, variantId) =>
        set((staat) => ({
          regels: staat.regels.filter((r) => sleutelVan(r.slug, r.variantId) !== sleutelVan(slug, variantId)),
        })),

      leegmaken: () => set({ regels: [], kortingscode: null }),
      zetKortingscode: (code) => set({ kortingscode: code }),
    }),
    {
      name: "ukm-winkelwagen",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    },
  ),
);

interface VerlanglijstStore {
  slugs: string[];
  wissel: (slug: string) => void;
  verwijder: (slug: string) => void;
  leegmaken: () => void;
}

export const useVerlanglijst = create<VerlanglijstStore>()(
  persist(
    (set) => ({
      slugs: [],
      wissel: (slug) =>
        set((staat) => ({
          slugs: staat.slugs.includes(slug) ? staat.slugs.filter((s) => s !== slug) : [slug, ...staat.slugs],
        })),
      verwijder: (slug) => set((staat) => ({ slugs: staat.slugs.filter((s) => s !== slug) })),
      leegmaken: () => set({ slugs: [] }),
    }),
    { name: "ukm-verlanglijst", storage: createJSONStorage(() => localStorage), skipHydration: true },
  ),
);

const MAX_RECENT = 8;

interface RecentStore {
  slugs: string[];
  registreer: (slug: string) => void;
}

export const useRecentBekeken = create<RecentStore>()(
  persist(
    (set) => ({
      slugs: [],
      registreer: (slug) =>
        set((staat) => ({ slugs: [slug, ...staat.slugs.filter((s) => s !== slug)].slice(0, MAX_RECENT) })),
    }),
    { name: "ukm-recent-bekeken", storage: createJSONStorage(() => localStorage), skipHydration: true },
  ),
);

/** Losse store voor de vraag "is de opgeslagen staat al ingelezen?". */
const useHydratiestand = create<{ gereed: boolean }>(() => ({ gereed: false }));

let hydratieGestart = false;

/**
 * Haalt de opgeslagen staat op na de eerste render en meldt wanneer dat klaar is.
 * Componenten die aantallen tonen wachten hierop, zodat de server-HTML en de
 * eerste client-render identiek blijven.
 *
 * Het inlezen gebeurt eenmalig voor de hele pagina, ook al roepen de
 * navigatiebalk, de productkaarten en de winkelwagen deze hook allemaal aan.
 */
export function useWinkelHydratie(): boolean {
  const gereed = useHydratiestand((staat) => staat.gereed);

  React.useEffect(() => {
    if (hydratieGestart) return;
    hydratieGestart = true;

    void Promise.all([
      useWinkelwagen.persist.rehydrate(),
      useVerlanglijst.persist.rehydrate(),
      useRecentBekeken.persist.rehydrate(),
    ]).then(() => useHydratiestand.setState({ gereed: true }));
  }, []);

  return gereed;
}

/** Totaal aantal artikelen in de winkelwagen, voor de teller in de navigatiebalk. */
export function useWinkelwagenAantal(): number {
  return useWinkelwagen((staat) => staat.regels.reduce((som, regel) => som + regel.aantal, 0));
}
