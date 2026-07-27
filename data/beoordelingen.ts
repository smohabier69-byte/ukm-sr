import { keuze, tussen } from "./catalogus/gemeenschappelijk";
import type { Beoordeling, Product } from "@/types/product";

/**
 * Beoordelingen voor de demonstratie.
 *
 * Er is geen echte klantenfeedback beschikbaar, dus worden de recensies uit de
 * productslug afgeleid. Daardoor tonen server en client dezelfde teksten en
 * blijven ze bij elk bezoek gelijk, in plaats van bij iedere render te wisselen.
 */
const namen = [
  "Priya R.", "Anisha D.", "Kevin S.", "Shirley M.", "Rajesh P.", "Melissa K.",
  "Roshni B.", "Dwight A.", "Cynthia V.", "Farid H.", "Naomi L.", "Sharon G.",
  "Imran K.", "Chantal W.", "Devi N.", "Marlon T.", "Soraya J.", "Ricardo F.",
];

const brilTitels = [
  "Precies wat ik zocht",
  "Zit heel comfortabel",
  "Mooier dan op de foto",
  "Merk echt verschil",
  "Blij mee",
  "Goede kwaliteit",
];

const lensTitels = [
  "Natuurlijke kleur",
  "Comfortabel de hele dag",
  "Mooie tint",
  "Precies zoals verwacht",
  "Zacht en fijn",
  "Krijg veel complimenten",
];

const brilLof = [
  "Ik zit de hele dag achter een scherm en merk aan het eind van de middag echt verschil. Mijn ogen zijn veel minder branderig.",
  "Het montuur is lichter dan ik dacht. Na een uur voel je hem eigenlijk niet meer zitten.",
  "De pasvorm is goed, glijdt niet van mijn neus af tijdens het werken.",
  "Kwaliteit voelt stevig aan, niet als een goedkope bril. De scharnieren lopen soepel.",
  "In de winkel konden ze goed adviseren welk model bij mijn gezicht past. Fijne service.",
  "Slaap merkbaar beter sinds ik hem 's avonds draag.",
];

const ptcLof = [
  "Het verkleuren gaat echt snel. Binnen een paar tellen buiten is hij donker.",
  "Handig dat ik geen aparte zonnebril meer hoef mee te nemen.",
  "Binnen is hij volledig helder, dat had ik niet verwacht van een meekleurende bril.",
  "Bij fel zonlicht wordt hij lekker donker. Op bewolkte dagen kleurt hij wat minder, maar dat is logisch.",
];

const lensLof = [
  "De kleur ziet er natuurlijk uit, niemand heeft door dat het lenzen zijn.",
  "Zitten zacht, ik heb ze een hele dag in gehad zonder droge ogen.",
  "De rand is niet te hard afgetekend, dat vind ik juist mooi.",
  "Op mijn donkere ogen komt de kleur mooi uit, subtieler dan ik dacht.",
  "Verpakking was netjes verzegeld en de houdbaarheidsdatum stond er duidelijk op.",
];

const service = [
  "Bestelling werd dezelfde week nog thuisbezorgd.",
  "Via WhatsApp snel antwoord gekregen op mijn vraag.",
  "Zelf opgehaald aan de Rembrandtstraat, ging heel vlot.",
  "Netjes verpakt, met hoesje en doekje erbij.",
];

const kanttekeningen = [
  "Enige minpuntje: ik had hem graag in nog een kleur gezien.",
  "Even wennen de eerste dagen, daarna prima.",
  "Het hoesje is wat aan de kleine kant.",
  "Had gehoopt dat hij iets breder zou zijn, maar hij zit goed.",
  "Levering duurde iets langer dan verwacht.",
];

const PEILDATUM = new Date("2026-04-01T00:00:00Z");

/**
 * Bouwt de recensies bij een product. Het aantal volgt het getal dat op de
 * productkaart staat, met een maximum van zes uitgeschreven teksten.
 */
export function beoordelingenVoor(product: Product): Beoordeling[] {
  const aantal = Math.min(6, Math.max(2, Math.round(product.aantalBeoordelingen / 22)));
  const titels = product.soort === "bril" ? brilTitels : lensTitels;

  const lofpool =
    product.soort === "lens" ? lensLof : product.techniek === "ptc" ? [...brilLof, ...ptcLof] : brilLof;

  return Array.from({ length: aantal }, (_, i) => {
    const zaad = `${product.slug}:beoordeling-${i}`;

    // De gemiddelde score van het product bepaalt hoe streng de losse recensies zijn.
    const streng = product.score < 4.4 && i % 3 === 0;
    const score = streng ? tussen(zaad, "score", 3, 4) : tussen(zaad, "score", 4, 5);

    const delen = [keuze(zaad, "lof", lofpool)];
    if (tussen(zaad, "service", 0, 2) === 0) delen.push(keuze(zaad, "servicetekst", service));
    if (score <= 4) delen.push(keuze(zaad, "kanttekening", kanttekeningen));

    const dagenTerug = tussen(zaad, "datum", 5, 400);

    return {
      id: `${product.slug}-beoordeling-${i}`,
      naam: keuze(zaad, "naam", namen),
      score,
      datum: new Date(PEILDATUM.getTime() - dagenTerug * 86_400_000).toISOString().slice(0, 10),
      titel: keuze(zaad, "titel", titels),
      tekst: delen.join(" "),
      geverifieerd: tussen(zaad, "geverifieerd", 0, 4) > 0,
    };
  }).sort((a, b) => b.datum.localeCompare(a.datum));
}

/** Verdeling over vijf sterren, voor de balkjes bij het gemiddelde. */
export function scoreverdeling(beoordelingen: Beoordeling[]): { ster: number; aantal: number }[] {
  return [5, 4, 3, 2, 1].map((ster) => ({
    ster,
    aantal: beoordelingen.filter((b) => b.score === ster).length,
  }));
}
