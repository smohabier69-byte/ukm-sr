import { achternamen, dagenGeleden, isoDatum, keuze, kans, tussen, voornamen, wijken } from "./basis";

export interface Klant {
  id: string;
  naam: string;
  email: string;
  telefoon: string;
  wijk: string;
  klantSinds: string;
  /** Klanten die zich hebben aangemeld voor de nieuwsbrief. */
  nieuwsbrief: boolean;
}

const AANTAL_KLANTEN = 48;

/** Vaste klantenlijst; bestellingen verwijzen hiernaar. */
export const klanten: Klant[] = Array.from({ length: AANTAL_KLANTEN }, (_, i) => {
  const sleutel = `klant-${i}`;
  const voornaam = keuze(`${sleutel}:voor`, voornamen);
  const achternaam = keuze(`${sleutel}:achter`, achternamen);
  const naam = `${voornaam} ${achternaam}`;

  return {
    id: `K-${String(1000 + i)}`,
    naam,
    email: `${voornaam.toLowerCase()}.${achternaam.toLowerCase().replace(/[^a-z]/g, "")}@${keuze(`${sleutel}:domein`, ["gmail.com", "hotmail.com", "sr.net", "live.nl"])}`,
    telefoon: `8${tussen(`${sleutel}:tel`, 100000, 999999)}`,
    wijk: keuze(`${sleutel}:wijk`, wijken),
    /*
     * Het klantenbestand groeit, dus recente aanmeldingen zijn talrijker dan
     * oude. De macht buigt de gelijkmatige verdeling naar het heden toe; zonder
     * die weging vallen er nauwelijks klanten binnen de laatste dertig dagen en
     * blijft de tegel "nieuwe klanten" op nul staan.
     */
    klantSinds: isoDatum(dagenGeleden(1 + Math.round(kans(`${sleutel}:sinds`) ** 1.7 * 700))),
    nieuwsbrief: kans(`${sleutel}:nieuwsbrief`) < 0.55,
  };
});

export function klantOpId(id: string): Klant | undefined {
  return klanten.find((k) => k.id === id);
}
