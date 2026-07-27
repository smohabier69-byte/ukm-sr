"use client";

import * as React from "react";
import Image from "next/image";
import { Play } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Video-showcase op basis van echte opnames uit de winkel.
 *
 * De video zelf wordt pas aangemaakt zodra iemand op afspelen klikt. Tot die
 * klik bestaat er geen <video>-element en vraagt de browser dus geen enkele
 * videobyte op - alleen het posterbeeld, dat als een gewone, lui geladen
 * afbeelding meeloopt met de rest van de pagina. Zo kan deze video, hoe groot
 * hij ook is, nooit met de rest van de site om bandbreedte concurreren.
 */
export function ProductVideoShowcase({
  bron,
  webmBron,
  poster,
  titel,
  className,
}: {
  bron: string;
  webmBron?: string;
  poster: string;
  titel: string;
  className?: string;
}) {
  const [afspelen, setAfspelen] = React.useState(false);

  return (
    <div
      className={cn(
        "relative mx-auto aspect-[9/16] w-full max-w-sm overflow-hidden rounded-3xl bg-creme-diep shadow-kaart",
        className,
      )}
    >
      {afspelen ? (
        <video
          className="size-full object-cover"
          controls
          autoPlay
          playsInline
          preload="none"
          poster={poster}
          aria-label={titel}
        >
          {webmBron ? <source src={webmBron} type="video/webm" /> : null}
          <source src={bron} type="video/mp4" />
        </video>
      ) : (
        <button
          type="button"
          onClick={() => setAfspelen(true)}
          className="group relative size-full cursor-pointer"
          aria-label={`${titel} afspelen`}
        >
          <Image
            src={poster}
            alt={titel}
            fill
            sizes="(min-width: 640px) 24rem, 90vw"
            className="object-cover"
          />
          <div className="absolute inset-0 overlay-onder transition-opacity duration-300 group-hover:opacity-80" />

          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex size-16 items-center justify-center rounded-full bg-white/90 text-inkt shadow-zwevend backdrop-blur-sm transition-transform duration-300 ease-[var(--ease-uit)] group-hover:scale-110">
              <Play className="ml-1 size-6 fill-current" />
            </span>
          </span>

          <span className="absolute inset-x-0 bottom-0 p-5 text-left text-white">
            <span className="block font-display text-lg font-semibold">{titel}</span>
            <span className="mt-1 block text-xs text-white/75">Video &middot; opgenomen in de winkel</span>
          </span>
        </button>
      )}
    </div>
  );
}
