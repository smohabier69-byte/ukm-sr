import * as React from "react";

import { cn } from "@/lib/utils";

/** Stervormige rand: 28 punten, afwisselend op de buiten- en de binnenstraal. */
const PUNTEN = Array.from({ length: 56 }, (_, i) => {
  const straal = i % 2 === 0 ? 50 : 45.5;
  const hoek = (i / 56) * Math.PI * 2;
  return `${(50 + straal * Math.cos(hoek)).toFixed(2)},${(50 + straal * Math.sin(hoek)).toFixed(2)}`;
}).join(" ");

/**
 * Het gouden prijszegel uit de prijslijsten van UKM: een gekartelde sticker
 * met de prijs erin. Puur decoratief vormgegeven, de inhoud blijft gewone
 * tekst en dus leesbaar voor schermlezers.
 */
export function Zegel({
  children,
  className,
  toon = "goud",
}: {
  children: React.ReactNode;
  className?: string;
  toon?: "goud" | "salie" | "blush";
}) {
  // Uniek per zegel, zodat meerdere zegels op een pagina elk hun eigen verloop houden.
  const id = React.useId();
  const kleuren =
    toon === "goud"
      ? ["#f3dc9c", "#c79a3a", "#e8c66e"]
      : toon === "salie"
        ? ["#c5d2be", "#74896a", "#a8b8a0"]
        : ["#f8d9d4", "#cf7a74", "#eab0a9"];

  return (
    <span
      className={cn(
        "relative inline-flex size-20 shrink-0 items-center justify-center text-center leading-none drop-shadow-[0_6px_10px_rgb(16_15_13/0.18)]",
        toon === "goud" ? "text-inkt" : "text-white",
        className,
      )}
    >
      <svg viewBox="0 0 100 100" aria-hidden className="absolute inset-0 size-full">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={kleuren[0]} />
            <stop offset="0.5" stopColor={kleuren[1]} />
            <stop offset="1" stopColor={kleuren[2]} />
          </linearGradient>
        </defs>
        <polygon points={PUNTEN} fill={`url(#${id})`} />
        <circle cx="50" cy="50" r="38" fill="none" stroke="rgb(255 255 255 / 0.55)" strokeWidth="0.8" />
      </svg>
      <span className="relative">{children}</span>
    </span>
  );
}
