/**
 * Surinaamse notatieconventies.
 *
 * UKM schrijft bedragen in hun prijslijsten als "SRD 695,-": duizendtallen met
 * een punt, decimalen met een komma, en hele bedragen met een streepje in plaats
 * van ",00". Die schrijfwijze houden we aan zodat de winkel leest zoals de
 * folder die klanten al kennen.
 */

const getal = new Intl.NumberFormat("nl-SR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatPrijs(bedrag: number): string {
  const delen = getal.format(bedrag);
  return `SRD ${delen.endsWith(",00") ? `${delen.slice(0, -3)},-` : delen}`;
}

/** Zonder valuta-aanduiding, voor tabellen en invoervelden. */
export function formatBedrag(bedrag: number): string {
  return getal.format(bedrag);
}

export function formatKorting(van: number, voor: number): number {
  if (van <= 0 || voor >= van) return 0;
  return Math.round(((van - voor) / van) * 100);
}

const datum = new Intl.DateTimeFormat("nl-SR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

export function formatDatum(waarde: Date | string): string {
  return datum.format(typeof waarde === "string" ? new Date(waarde) : waarde);
}

const datumLang = new Intl.DateTimeFormat("nl-SR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function formatDatumLang(waarde: Date | string): string {
  return datumLang.format(typeof waarde === "string" ? new Date(waarde) : waarde);
}

/** "1.234" - voor volgersaantallen en statistieken. */
export function formatAantal(waarde: number): string {
  return new Intl.NumberFormat("nl-SR").format(waarde);
}

export function slugify(waarde: string): string {
  return waarde
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
