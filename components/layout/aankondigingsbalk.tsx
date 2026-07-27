import { MapPin, Sparkles, Truck } from "lucide-react";

import { bedrijf } from "@/lib/site";
import { formatPrijs } from "@/lib/format";

const berichten = [
  { icoon: Truck, tekst: `Gratis bezorging in Paramaribo vanaf ${formatPrijs(bedrijf.gratisBezorgingVanaf)}` },
  { icoon: Sparkles, tekst: "Nieuw binnen: de PTC Signature collectie" },
  { icoon: MapPin, tekst: `Persoonlijk passen aan de ${bedrijf.adres.straat}` },
];

/**
 * Doorlopende balk boven de navigatie. De inhoud staat twee keer in de DOM zodat
 * de animatie naadloos rondloopt; de kopie is verborgen voor schermlezers.
 */
export function Aankondigingsbalk() {
  return (
    <div className="relative overflow-hidden bg-inkt text-creme">
      <div className="flex w-max marquee-spoor motion-reduce:animate-none">
        {[0, 1].map((kopie) => (
          <ul
            key={kopie}
            aria-hidden={kopie === 1}
            className="flex shrink-0 items-center gap-10 px-5 py-2.5 text-[0.8125rem]"
          >
            {berichten.map(({ icoon: Icoon, tekst }) => (
              <li key={tekst} className="flex shrink-0 items-center gap-2 whitespace-nowrap">
                <Icoon className="size-3.5 text-salie-300" />
                <span>{tekst}</span>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
