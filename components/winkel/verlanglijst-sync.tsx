"use client";

import * as React from "react";
import { useSession } from "next-auth/react";

import { mergeGastVerlanglijst } from "@/app/(winkel)/verlanglijst/acties";
import { useVerlanglijst } from "@/lib/winkel/stores";
import { laadVerlanglijstSessie } from "@/lib/winkel/verlanglijst-sessie";

/**
 * Onzichtbaar: reageert eenmalig op het inloggen door de anonieme
 * localStorage-verlanglijst naar de database te migreren en daarna de
 * sessie-lijst in te lezen. Verandert niets aan het gedrag voor
 * uitgelogde bezoekers.
 */
export function VerlanglijstSync() {
  const { status } = useSession();
  const verwerkt = React.useRef(false);
  const leegmaakGast = useVerlanglijst((staat) => staat.leegmaken);

  React.useEffect(() => {
    if (status !== "authenticated" || verwerkt.current) return;
    verwerkt.current = true;

    void (async () => {
      const gastSlugs = useVerlanglijst.getState().slugs;
      if (gastSlugs.length > 0) {
        await mergeGastVerlanglijst(gastSlugs);
        leegmaakGast();
      }
      await laadVerlanglijstSessie();
    })();
  }, [status, leegmaakGast]);

  return null;
}
