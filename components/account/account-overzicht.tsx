"use client";

import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useWinkelHydratie, useWinkelwagenAantal } from "@/lib/winkel/stores";
import { useVerlanglijstGereed, useVerlanglijstSlugs } from "@/lib/winkel/verlanglijst-actief";

/**
 * Toont wat er werkelijk in deze browser is opgeslagen: de verlanglijst en de
 * winkelwagen. Dat zijn de enige echte gegevens die een accountpagina zonder
 * aanmelding kan laten zien.
 */
export function AccountOverzicht() {
  const wagenGehydrateerd = useWinkelHydratie();
  const verlanglijstGereed = useVerlanglijstGereed();
  const bewaard = useVerlanglijstSlugs().length;
  const inWagen = useWinkelwagenAantal();

  if (!wagenGehydrateerd || !verlanglijstGereed) {
    return (
      <div className="grid gap-4 sm:grid-cols-2" aria-busy>
        <Skeleton className="h-36 rounded-2xl" />
        <Skeleton className="h-36 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Tegel
        icoon={<Heart className="size-5" />}
        label="Op je verlanglijst"
        waarde={`${bewaard} ${bewaard === 1 ? "artikel" : "artikelen"}`}
        knop={{ label: "Bekijk verlanglijst", href: "/verlanglijst" }}
      />
      <Tegel
        icoon={<ShoppingBag className="size-5" />}
        label="In je winkelwagen"
        waarde={`${inWagen} ${inWagen === 1 ? "artikel" : "artikelen"}`}
        knop={{ label: "Naar winkelwagen", href: "/winkelwagen" }}
      />
    </div>
  );
}

function Tegel({
  icoon,
  label,
  waarde,
  knop,
}: {
  icoon: React.ReactNode;
  label: string;
  waarde: string;
  knop: { label: string; href: string };
}) {
  return (
    <div className="flex flex-col rounded-2xl border border-border/70 bg-white p-6">
      <span className="flex size-11 items-center justify-center rounded-full bg-salie-100 text-salie-700">
        {icoon}
      </span>
      <p className="mt-4 text-sm text-inkt-zacht">{label}</p>
      <p className="mt-1 font-display text-xl font-bold">{waarde}</p>
      <Button asChild variant="outline" size="sm" className="mt-5 self-start">
        <Link href={knop.href}>{knop.label}</Link>
      </Button>
    </div>
  );
}
