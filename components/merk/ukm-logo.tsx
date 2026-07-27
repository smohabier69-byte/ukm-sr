import { cn } from "@/lib/utils";
import { bedrijf } from "@/lib/site";

/**
 * Het officiele UKM.sr-merkteken is een woordmerk: "UKM.Sr" in een vet
 * geometrisch schreefloos lettertype, met daaronder de tagline. Hier is het
 * getypezet in plaats van als bitmap geplaatst, zodat het op elk scherm scherp
 * blijft, meeschaalt en van kleur kan wisselen op donkere achtergronden.
 * De originele bitmap staat in /public/merk/ukm-logo.jpg.
 */
export function UkmLogo({
  className,
  metTagline = false,
  toon = "inkt",
}: {
  className?: string;
  metTagline?: boolean;
  toon?: "inkt" | "wit" | "salie";
}) {
  const kleur = toon === "wit" ? "text-white" : toon === "salie" ? "text-salie-700" : "text-inkt";

  return (
    <span className={cn("inline-flex flex-col items-start leading-none", kleur, className)}>
      <span className="font-display text-[1.375rem] font-extrabold tracking-[-0.03em]">
        UKM<span className={toon === "wit" ? "text-white/70" : "text-salie-500"}>.</span>Sr
      </span>
      {metTagline ? (
        <span
          className={cn(
            "mt-1 font-display text-[0.5625rem] font-semibold tracking-[0.16em] uppercase",
            toon === "wit" ? "text-white/65" : "text-inkt-zacht",
          )}
        >
          {bedrijf.tagline}
        </span>
      ) : null}
    </span>
  );
}

/** Vierkant merkteken voor avatars, favicons en compacte plekken. */
export function UkmMerkteken({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex items-center justify-center rounded-xl bg-salie-300 font-display text-sm font-extrabold tracking-[-0.03em] text-white",
        className,
      )}
    >
      UKM
    </span>
  );
}
