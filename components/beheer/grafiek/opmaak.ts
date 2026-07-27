import { formatAantal, formatPrijs } from "@/lib/format";

/**
 * Eenheid van een grafiekreeks.
 *
 * De grafieken zijn clientcomponenten en de pagina's die ze gebruiken draaien
 * op de server. Een opmaakfunctie kan die grens niet over - React kan hem niet
 * serialiseren - dus geven de pagina's deze sleutel door en zoekt de grafiek de
 * bijbehorende opmaak zelf op.
 */
export type Eenheid = "srd" | "aantal" | "stuks" | "bestellingen";

const opmaken: Record<Eenheid, (waarde: number) => string> = {
  srd: formatPrijs,
  aantal: formatAantal,
  stuks: (waarde) => `${formatAantal(waarde)} stuks`,
  bestellingen: (waarde) => `${formatAantal(waarde)} ${waarde === 1 ? "bestelling" : "bestellingen"}`,
};

export function opmaakVan(eenheid: Eenheid): (waarde: number) => string {
  return opmaken[eenheid];
}
