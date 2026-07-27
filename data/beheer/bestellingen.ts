import { producten } from "@/data/producten";
import { bedrijf } from "@/lib/site";
import { klanten } from "./klanten";
import { PEILDATUM, isoDatum, kans, keuze, tussen } from "./basis";

export type Bestelstatus = "nieuw" | "in-behandeling" | "onderweg" | "afgerond" | "geannuleerd";

export const statuslabels: Record<Bestelstatus, string> = {
  nieuw: "Nieuw",
  "in-behandeling": "In behandeling",
  onderweg: "Onderweg",
  afgerond: "Afgerond",
  geannuleerd: "Geannuleerd",
};

/** Welke statuskleur uit het designsysteem bij welke stand hoort. */
export const statustoon: Record<Bestelstatus, "goed" | "waarschuwing" | "ernstig" | "kritiek" | "neutraal"> = {
  nieuw: "neutraal",
  "in-behandeling": "waarschuwing",
  onderweg: "ernstig",
  afgerond: "goed",
  geannuleerd: "kritiek",
};

export interface Bestelregel {
  slug: string;
  naam: string;
  aantal: number;
  stukprijs: number;
}

export interface Bestelling {
  nummer: string;
  klantId: string;
  klantnaam: string;
  datum: string;
  status: Bestelstatus;
  bezorgwijze: "bezorgen" | "afhalen";
  betaalwijze: "contant" | "overschrijving" | "pin";
  kortingscode?: string;
  regels: Bestelregel[];
  subtotaal: number;
  korting: number;
  bezorgkosten: number;
  totaal: number;
}

const MAANDEN_HISTORIE = 12;

/** Bestellingen in de oudste maand; vanaf daar groeit het volume. */
const BASISVOLUME = 7;
const MAANDGROEI = 1.12;

/**
 * Trekt een product met kans naar rato van zijn populariteit, zodat de
 * bestsellers in de rapportages ook echt bovenaan eindigen.
 */
const gewogenPool: string[] = producten.flatMap((product) =>
  Array.from({ length: Math.max(1, Math.round(product.populariteit / 10)) }, () => product.slug),
);

/**
 * Hoeveel bestellingen elke maand krijgt.
 *
 * Het volume wordt per maand vastgesteld in plaats van bestellingen willekeurig
 * over het jaar te strooien. Dat levert een curve op die oploopt zoals een
 * groeiende winkel er werkelijk uitziet, met een piek in december, in plaats van
 * de grillige zaagtand die je krijgt als het toeval de verdeling bepaalt.
 * De lopende maand telt alleen de dagen die al voorbij zijn.
 */
function maandvolumes(): { start: Date; eind: Date; aantal: number }[] {
  const volumes: { start: Date; eind: Date; aantal: number }[] = [];

  for (let i = 0; i < MAANDEN_HISTORIE; i++) {
    const maandTerug = MAANDEN_HISTORIE - 1 - i;
    const start = new Date(Date.UTC(PEILDATUM.getUTCFullYear(), PEILDATUM.getUTCMonth() - maandTerug, 1));
    const volgendeMaand = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 1));
    const eind = volgendeMaand > PEILDATUM ? PEILDATUM : volgendeMaand;

    const feestdagen = start.getUTCMonth() === 11 ? 1.35 : start.getUTCMonth() === 0 ? 0.85 : 1;
    const volledig = BASISVOLUME * MAANDGROEI ** i * feestdagen;

    // Alleen het verstreken deel van de lopende maand meetellen.
    const dagenInMaand = (volgendeMaand.getTime() - start.getTime()) / 86_400_000;
    const verstreken = (eind.getTime() - start.getTime()) / 86_400_000;
    const deel = Math.max(0, Math.min(1, verstreken / dagenInMaand));

    volumes.push({ start, eind, aantal: Math.max(1, Math.round(volledig * deel)) });
  }

  return volumes;
}

function bepaalStatus(dagenTerug: number, sleutel: string): Bestelstatus {
  const p = kans(sleutel);
  if (dagenTerug <= 1) return p < 0.6 ? "nieuw" : "in-behandeling";
  if (dagenTerug <= 4) return p < 0.35 ? "in-behandeling" : "onderweg";
  if (p < 0.045) return "geannuleerd";
  return "afgerond";
}

function maakBestelling(index: number, datum: Date, dagenTerug: number): Bestelling {
  const sleutel = `bestelling-${index}`;
  const klant = klanten[tussen(`${sleutel}:klant`, 0, klanten.length - 1)];
  const aantalRegels = kans(`${sleutel}:regels`) < 0.55 ? 1 : kans(`${sleutel}:regels2`) < 0.75 ? 2 : 3;

  const gekozen = new Set<string>();
  for (let r = 0; r < aantalRegels; r++) {
    gekozen.add(keuze(`${sleutel}:product-${r}`, gewogenPool));
  }

  const regels: Bestelregel[] = [...gekozen].map((slug) => {
    const product = producten.find((p) => p.slug === slug)!;
    return {
      slug,
      naam: product.naam,
      aantal: kans(`${sleutel}:aantal-${slug}`) < 0.82 ? 1 : 2,
      stukprijs: product.prijs,
    };
  });

  const subtotaal = regels.reduce((som, regel) => som + regel.stukprijs * regel.aantal, 0);

  const heeftCode = kans(`${sleutel}:code`) < 0.18;
  const kortingscode = heeftCode ? keuze(`${sleutel}:welke`, ["WELKOM10", "UKM50"]) : undefined;
  const korting =
    kortingscode === "WELKOM10"
      ? Math.round(subtotaal * 0.1)
      : kortingscode === "UKM50" && subtotaal >= 500
        ? 50
        : 0;

  const bezorgwijze = kans(`${sleutel}:bezorg`) < 0.62 ? "bezorgen" : "afhalen";
  const naKorting = subtotaal - korting;
  const bezorgkosten =
    bezorgwijze === "afhalen" || naKorting >= bedrijf.gratisBezorgingVanaf ? 0 : bedrijf.bezorgingVanaf;

  return {
    nummer: `UKM-${datum.getUTCFullYear()}-${String(1000 + index).slice(1)}`,
    klantId: klant.id,
    klantnaam: klant.naam,
    datum: isoDatum(datum),
    status: bepaalStatus(dagenTerug, `${sleutel}:status`),
    bezorgwijze,
    betaalwijze: keuze(`${sleutel}:betaling`, ["contant", "overschrijving", "pin"] as const),
    kortingscode,
    regels,
    subtotaal,
    korting,
    bezorgkosten,
    totaal: naKorting + bezorgkosten,
  };
}

export const bestellingen: Bestelling[] = (() => {
  const lijst: Bestelling[] = [];
  let teller = 0;

  for (const maand of maandvolumes()) {
    const spanne = Math.max(1, (maand.eind.getTime() - maand.start.getTime()) / 86_400_000);

    for (let n = 0; n < maand.aantal; n++) {
      const verschuiving = kans(`maandorder-${teller}:dag`) * spanne;
      const datum = new Date(maand.start.getTime() + Math.floor(verschuiving) * 86_400_000);
      const dagenTerug = Math.round((PEILDATUM.getTime() - datum.getTime()) / 86_400_000);

      lijst.push(maakBestelling(teller, datum, dagenTerug));
      teller++;
    }
  }

  return lijst.sort((a, b) => b.datum.localeCompare(a.datum));
})();

/** Bestellingen die geld hebben opgeleverd; geannuleerde tellen niet mee in de omzet. */
export const geldigeBestellingen = bestellingen.filter((b) => b.status !== "geannuleerd");

export function bestellingOpNummer(nummer: string): Bestelling | undefined {
  return bestellingen.find((b) => b.nummer === nummer);
}

export function bestellingenVanKlant(klantId: string): Bestelling[] {
  return bestellingen.filter((b) => b.klantId === klantId);
}
