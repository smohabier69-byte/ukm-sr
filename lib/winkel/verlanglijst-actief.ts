"use client";

import { useSession } from "next-auth/react";

import { useVerlanglijst, useWinkelHydratie } from "./stores";
import { useVerlanglijstSessie } from "./verlanglijst-sessie";

/**
 * Kiest tussen de anonieme localStorage-verlanglijst en de DB-gedreven
 * versie voor ingelogde gebruikers, met dezelfde vorm als de oorspronkelijke
 * useVerlanglijst-selectors - zo blijven de aanroepende componenten
 * (VerlanglijstKnop, VerlanglijstInhoud, de header) vrijwel ongewijzigd.
 * Beide onderliggende stores worden altijd aangeroepen (rules of hooks); er
 * wordt alleen op het resultaat getakt.
 */
export function useVerlanglijstGereed(): boolean {
  const { status } = useSession();
  const gastGereed = useWinkelHydratie();
  const sessieGereed = useVerlanglijstSessie((s) => s.gereed);
  if (status === "loading") return false;
  return status === "authenticated" ? sessieGereed : gastGereed;
}

export function useVerlanglijstSlugs(): string[] {
  const { status } = useSession();
  const gastSlugs = useVerlanglijst((s) => s.slugs);
  const sessieSlugs = useVerlanglijstSessie((s) => s.slugs);
  return status === "authenticated" ? sessieSlugs : gastSlugs;
}

export function useVerlanglijstActies() {
  const { status } = useSession();
  const gastWissel = useVerlanglijst((s) => s.wissel);
  const gastVerwijder = useVerlanglijst((s) => s.verwijder);
  const gastLeegmaken = useVerlanglijst((s) => s.leegmaken);
  const sessieWissel = useVerlanglijstSessie((s) => s.wissel);
  const sessieVerwijder = useVerlanglijstSessie((s) => s.verwijder);
  const sessieLeegmaken = useVerlanglijstSessie((s) => s.leegmaken);

  return status === "authenticated"
    ? { wissel: sessieWissel, verwijder: sessieVerwijder, leegmaken: sessieLeegmaken }
    : { wissel: gastWissel, verwijder: gastVerwijder, leegmaken: gastLeegmaken };
}
