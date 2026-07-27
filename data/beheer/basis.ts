/**
 * Gedeelde bouwstenen voor de demogegevens van het beheerpaneel.
 *
 * Alles wordt uit een vaste peildatum en een zaaifunctie afgeleid. Zo tonen
 * server en client dezelfde cijfers, blijft een schermafdruk van vandaag
 * morgen nog kloppen, en verandert er niets tussen twee renders.
 */

/** De "vandaag" van het beheerpaneel. Bewust vast, niet new Date(). */
export const PEILDATUM = new Date("2026-07-27T00:00:00Z");

export function zaad(sleutel: string): number {
  let h = 2166136261;
  for (let i = 0; i < sleutel.length; i++) {
    h ^= sleutel.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function tussen(sleutel: string, min: number, max: number): number {
  return min + (zaad(sleutel) % (max - min + 1));
}

export function keuze<T>(sleutel: string, opties: readonly T[]): T {
  return opties[zaad(sleutel) % opties.length];
}

/** Waarde tussen 0 en 1, voor kansberekeningen. */
export function kans(sleutel: string): number {
  return (zaad(sleutel) % 10_000) / 10_000;
}

export function dagenGeleden(aantal: number): Date {
  return new Date(PEILDATUM.getTime() - aantal * 86_400_000);
}

export function isoDatum(datum: Date): string {
  return datum.toISOString().slice(0, 10);
}

export const maandnamen = [
  "jan", "feb", "mrt", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "dec",
];

export const wijken = [
  "Centrum", "Rainville", "Uitvlugt", "Flora", "Tourtonne", "Geyersvlijt",
  "Blauwgrond", "Zorg en Hoop", "Munder", "Beekhuizen", "Latour", "Livorno",
  "Kwatta", "Combe", "Ma Retraite",
];

export const voornamen = [
  "Priya", "Anisha", "Kevin", "Shirley", "Rajesh", "Melissa", "Roshni", "Dwight",
  "Cynthia", "Farid", "Naomi", "Sharon", "Imran", "Chantal", "Devi", "Marlon",
  "Soraya", "Ricardo", "Iwan", "Meredith", "Sandro", "Yvonne", "Radj", "Gina",
  "Steven", "Fabiola", "Winston", "Astrid", "Kishan", "Lorraine",
];

export const achternamen = [
  "Ramdin", "Kartodikromo", "Pinas", "Sewnarain", "Amatali", "Blanker", "Jharap",
  "Wijngaarde", "Soekhlal", "Vasilda", "Karijomenawi", "Doerga", "Adjako",
  "Tjon A Loi", "Bhagwandas", "Misidjan", "Refos", "Pawirodirjo", "Sitaldin",
  "Grunberg", "Alimoestar", "Nannan Panday", "Simson", "Marengo", "Hasnoe",
];
