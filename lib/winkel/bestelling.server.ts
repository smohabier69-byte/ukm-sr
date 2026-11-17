import "server-only";

import { catalogus } from "@/lib/square/catalog.server";
import { db } from "@/lib/db/client";
import { bestellingen } from "@/lib/db/schema";
import { berekenKosten, bouwPosten, type Bezorgwijze, type Kostenoverzicht } from "@/lib/winkel/prijzen";
import type { Winkelwagenregel } from "@/lib/winkel/stores";
import { formatPrijs } from "@/lib/format";
import { bedrijf, siteUrl, whatsappLink } from "@/lib/site";

/**
 * Een bestelling van de website komt binnen als WhatsApp-bericht op het
 * zakelijke nummer van UKM, met alles erin wat nodig is om haar af te
 * handelen. De site prijst alles hier opnieuw na (de client levert alleen
 * slug + variant + aantal, nooit een prijs) en bouwt dat bericht.
 *
 * Elke bestelling wordt ook opgeslagen. De TCT-WhatsApp-bot van UKM haalt
 * nieuwe bestellingen elke minuut op (/api/bestellingen/openstaand) en stuurt
 * ze naar de eigenaar, zonder dat de klant iets hoeft te doen. Zolang die bot
 * niet gekoppeld is (BESTELLING_BOT_SLEUTEL ontbreekt), verstuurt de klant het
 * bericht zelf vanaf de bevestigingspagina.
 */

export type Betaalwijze = "contant" | "overschrijving" | "pin";

export interface BestellingInvoer {
  regels: Winkelwagenregel[];
  contact: { voornaam: string; achternaam: string; telefoon: string; email: string };
  bezorgwijze: Bezorgwijze;
  adres?: { straat: string; wijk?: string; plaats: string; opmerking?: string };
  betaalwijze: Betaalwijze;
  kortingscode?: string | null;
}

export interface BestellingRegel {
  naam: string;
  uitvoering?: string;
  aantal: number;
  totaal: number;
}

export interface GeplaatsteBestelling {
  bestelnummer: string;
  whatsappUrl: string;
  regels: BestellingRegel[];
  kosten: Kostenoverzicht;
  bezorgwijze: Bezorgwijze;
  /** True als de WhatsApp-bot de bestelling zelf doorstuurt; de klant hoeft dan niets te doen. */
  automatisch: boolean;
}

export class BestellingFout extends Error {}

const betaalwijzeLabel: Record<Betaalwijze, string> = {
  contant: "Contant",
  overschrijving: "Bankoverschrijving",
  pin: "Pinnen",
};

/** Kort en leesbaar, zodat klant en winkel er in een gesprek naar kunnen verwijzen. */
function maakBestelnummer(): string {
  const nu = new Date();
  const datum = `${String(nu.getFullYear()).slice(2)}${String(nu.getMonth() + 1).padStart(2, "0")}${String(nu.getDate()).padStart(2, "0")}`;
  const volgnr = String(Math.floor(1000 + Math.random() * 9000));
  return `UKM-${datum}-${volgnr}`;
}

function bouwBericht(invoer: BestellingInvoer, bestelnummer: string, regels: BestellingRegel[], kosten: Kostenoverzicht) {
  const r: string[] = [];
  r.push(`*Nieuwe bestelling via de website (${siteUrl.replace(/^https?:\/\//, "")})*`);
  r.push(`Bestelnummer: ${bestelnummer}`);
  r.push("");
  r.push("*Artikelen*");
  for (const regel of regels) {
    r.push(`- ${regel.aantal}x ${regel.naam}${regel.uitvoering ? ` (${regel.uitvoering})` : ""}: ${formatPrijs(regel.totaal)}`);
  }
  r.push("");
  r.push(`Subtotaal: ${formatPrijs(kosten.subtotaal)}`);
  if (kosten.korting > 0) r.push(`Korting${invoer.kortingscode ? ` (${invoer.kortingscode})` : ""}: -${formatPrijs(kosten.korting)}`);
  if (invoer.bezorgwijze === "bezorgen") {
    r.push(`Bezorging: vanaf ${formatPrijs(kosten.bezorgkosten)} (+ ${formatPrijs(bedrijf.bezorgingPerKm)} per extra km)`);
    r.push(`*Totaal: vanaf ${formatPrijs(kosten.totaal)}*`);
  } else {
    r.push("Bezorging: afhalen in de winkel");
    r.push(`*Totaal: ${formatPrijs(kosten.totaal)}*`);
  }
  r.push("");
  r.push("*Klant*");
  r.push(`${invoer.contact.voornaam} ${invoer.contact.achternaam}`.trim());
  r.push(`Tel: ${invoer.contact.telefoon}`);
  r.push(`E-mail: ${invoer.contact.email}`);
  r.push("");
  if (invoer.bezorgwijze === "bezorgen" && invoer.adres) {
    r.push("*Bezorgen op*");
    r.push([invoer.adres.straat, invoer.adres.wijk, invoer.adres.plaats].filter(Boolean).join(", "));
    if (invoer.adres.opmerking) r.push(`Opmerking: ${invoer.adres.opmerking}`);
  } else {
    r.push(`*Afhalen* aan de ${bedrijf.adres.straat}`);
  }
  r.push(`Betaalwijze: ${betaalwijzeLabel[invoer.betaalwijze]}`);
  return r.join("\n");
}

/** De bot is gekoppeld zodra de gedeelde sleutel op de server staat. */
export function botGekoppeld(): boolean {
  return Boolean(process.env.BESTELLING_BOT_SLEUTEL);
}

export async function plaatsBestelling(invoer: BestellingInvoer): Promise<GeplaatsteBestelling> {
  const { producten } = await catalogus();
  const posten = bouwPosten(
    invoer.regels.map((r) => ({ ...r, aantal: Math.max(1, Math.min(10, Math.round(r.aantal))) })),
    producten,
  );
  if (posten.length === 0) throw new BestellingFout("De winkelwagen is leeg.");

  const uitverkocht = posten.find((p) => (p.variant ? p.variant.voorraad : p.product.voorraad) === 0);
  if (uitverkocht) {
    throw new BestellingFout(
      `${uitverkocht.product.naam}${uitverkocht.variant ? ` (${uitverkocht.variant.naam})` : ""} is uitverkocht.`,
    );
  }

  const kosten = berekenKosten(posten, invoer.kortingscode ?? null, invoer.bezorgwijze);
  const regels: BestellingRegel[] = posten.map((p) => ({
    naam: p.product.naam,
    uitvoering: p.variant?.naam,
    aantal: p.regel.aantal,
    totaal: p.totaal,
  }));

  const bestelnummer = maakBestelnummer();
  const bericht = bouwBericht(invoer, bestelnummer, regels, kosten);

  // Alleen opslaan als de bot gekoppeld is: zonder bot haalt niemand de
  // bestelling op, en de klant stuurt haar dan zelf via WhatsApp.
  let opgeslagen = false;
  if (botGekoppeld()) try {
    await db.insert(bestellingen).values({
      bestelnummer,
      bericht,
      gegevens: {
        regels,
        kosten,
        contact: invoer.contact,
        bezorgwijze: invoer.bezorgwijze,
        adres: invoer.adres ?? null,
        betaalwijze: invoer.betaalwijze,
        kortingscode: invoer.kortingscode ?? null,
      },
    });
    opgeslagen = true;
  } catch (fout) {
    // Zonder opslag kan de bot de bestelling niet ophalen; de klant krijgt
    // dan de knop om haar zelf via WhatsApp te sturen.
    console.error("Bestelling opslaan mislukt:", fout);
  }

  return {
    bestelnummer,
    whatsappUrl: whatsappLink(bericht),
    regels,
    kosten,
    bezorgwijze: invoer.bezorgwijze,
    automatisch: opgeslagen && botGekoppeld(),
  };
}
