"use client";

import { create } from "zustand";

import { haalVerlanglijstOp, wisselVerlanglijst, leegmaakVerlanglijst } from "@/app/(winkel)/verlanglijst/acties";

/**
 * DB-gedreven tegenhanger van useVerlanglijst (lib/winkel/stores.ts) voor
 * ingelogde gebruikers. Wijzigingen zijn optimistisch: de knop reageert
 * meteen, de server action volgt op de achtergrond.
 */
interface VerlanglijstSessieStore {
  slugs: string[];
  gereed: boolean;
  zetSlugs: (slugs: string[]) => void;
  wissel: (slug: string) => void;
  verwijder: (slug: string) => void;
  leegmaken: () => void;
}

export const useVerlanglijstSessie = create<VerlanglijstSessieStore>()((set, get) => ({
  slugs: [],
  gereed: false,

  zetSlugs: (slugs) => set({ slugs, gereed: true }),

  wissel: (slug) => {
    const staatErop = get().slugs.includes(slug);
    set({ slugs: staatErop ? get().slugs.filter((s) => s !== slug) : [slug, ...get().slugs] });
    void wisselVerlanglijst(slug);
  },

  // Verwijderen gebeurt altijd op een aanwezige slug, dus dezelfde
  // toggle-action als wissel() volstaat - geen aparte server action nodig.
  verwijder: (slug) => {
    set({ slugs: get().slugs.filter((s) => s !== slug) });
    void wisselVerlanglijst(slug);
  },

  leegmaken: () => {
    set({ slugs: [] });
    void leegmaakVerlanglijst();
  },
}));

/** Haalt de opgeslagen lijst eenmalig op; wordt aangeroepen door VerlanglijstSync. */
export async function laadVerlanglijstSessie() {
  const slugs = await haalVerlanglijstOp();
  useVerlanglijstSessie.getState().zetSlugs(slugs);
}
