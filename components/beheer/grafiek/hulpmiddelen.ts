"use client";

import * as React from "react";

/**
 * Meet de werkelijke breedte van de grafiekcontainer.
 *
 * De grafieken worden op ware grootte getekend in plaats van via een viewBox
 * geschaald. Zo blijven lijndiktes, hoekafrondingen en tekstgroottes exact
 * zoals ze bedoeld zijn, ongeacht de breedte van het scherm.
 */
export function useBreedte<T extends HTMLElement>(): [React.RefObject<T | null>, number] {
  const ref = React.useRef<T>(null);
  const [breedte, setBreedte] = React.useState(0);

  React.useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const waarnemer = new ResizeObserver(([invoer]) => {
      setBreedte(invoer.contentRect.width);
    });
    waarnemer.observe(element);
    return () => waarnemer.disconnect();
  }, []);

  return [ref, breedte];
}

/** Ronde asstappen: 0 / 5.000 / 10.000 in plaats van 0 / 4.837 / 9.674. */
export function asstappen(maximum: number, aantal = 4): number[] {
  if (maximum <= 0) return [0];

  const ruw = maximum / aantal;
  const grootteorde = 10 ** Math.floor(Math.log10(ruw));
  const genormaliseerd = ruw / grootteorde;
  const stap = (genormaliseerd <= 1 ? 1 : genormaliseerd <= 2 ? 2 : genormaliseerd <= 5 ? 5 : 10) * grootteorde;

  const stappen: number[] = [];
  for (let waarde = 0; waarde <= maximum + stap * 0.001; waarde += stap) stappen.push(waarde);
  return stappen;
}

/** Vloeiende lijn door de punten met een Catmull-Rom-benadering. */
export function vloeiendPad(punten: { x: number; y: number }[]): string {
  if (punten.length === 0) return "";
  if (punten.length < 3) return punten.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");

  let pad = `M${punten[0].x},${punten[0].y}`;
  for (let i = 0; i < punten.length - 1; i++) {
    const vorige = punten[i - 1] ?? punten[i];
    const huidig = punten[i];
    const volgende = punten[i + 1];
    const daarna = punten[i + 2] ?? volgende;

    const c1x = huidig.x + (volgende.x - vorige.x) / 6;
    const c1y = huidig.y + (volgende.y - vorige.y) / 6;
    const c2x = volgende.x - (daarna.x - huidig.x) / 6;
    const c2y = volgende.y - (daarna.y - huidig.y) / 6;

    pad += ` C${c1x},${c1y} ${c2x},${c2y} ${volgende.x},${volgende.y}`;
  }
  return pad;
}

/** Compacte weergave voor asstappen: 12,5K in plaats van 12.500. */
export function kortGetal(waarde: number): string {
  if (Math.abs(waarde) >= 1_000_000) return `${(waarde / 1_000_000).toFixed(1).replace(".", ",")}M`;
  if (Math.abs(waarde) >= 1_000) {
    const duizend = waarde / 1_000;
    return `${(duizend % 1 === 0 ? duizend.toFixed(0) : duizend.toFixed(1)).replace(".", ",")}K`;
  }
  return new Intl.NumberFormat("nl-SR").format(waarde);
}
