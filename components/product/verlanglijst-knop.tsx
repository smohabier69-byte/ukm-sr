"use client";

import { Heart } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useVerlanglijstActies, useVerlanglijstGereed, useVerlanglijstSlugs } from "@/lib/winkel/verlanglijst-actief";
import { cn } from "@/lib/utils";

/**
 * Knop om een product op de verlanglijst te zetten. Tot de opgeslagen lijst is
 * ingelezen toont de knop de neutrale stand, zodat de eerste render op de client
 * gelijk is aan de HTML van de server.
 */
export function VerlanglijstKnop({
  slug,
  naam,
  variant = "icoon",
  className,
}: {
  slug: string;
  naam: string;
  variant?: "icoon" | "volledig";
  className?: string;
}) {
  const gehydrateerd = useVerlanglijstGereed();
  const slugs = useVerlanglijstSlugs();
  const staatErop = slugs.includes(slug) && gehydrateerd;
  const { wissel } = useVerlanglijstActies();

  const klik = () => {
    wissel(slug);
    toast(staatErop ? "Van verlanglijst gehaald" : "Op verlanglijst gezet", {
      description: naam,
    });
  };

  if (variant === "volledig") {
    return (
      <Button type="button" variant="outline" size="lg" onClick={klik} className={className}>
        <Heart className={cn("transition-all", staatErop && "fill-koraal text-koraal")} />
        {staatErop ? "Op verlanglijst" : "Bewaren"}
      </Button>
    );
  }

  return (
    <button
      type="button"
      onClick={klik}
      aria-pressed={staatErop}
      aria-label={staatErop ? `${naam} van verlanglijst halen` : `${naam} op verlanglijst zetten`}
      className={cn(
        "rounded-full bg-white/90 p-2.5 text-inkt shadow-zacht backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white",
        className,
      )}
    >
      <Heart className={cn("size-4 transition-all", staatErop && "fill-koraal text-koraal")} />
    </button>
  );
}
