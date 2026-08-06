import "server-only";
import { eq } from "drizzle-orm";

import { squareClient, squareLocationId } from "./client";
import { catalogus } from "./catalog.server";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { kortingscodes } from "@/lib/winkel/prijzen";
import { siteUrl } from "@/lib/site";

/**
 * Echte bestellingen via Square: de site prijst hier nog een keer alles
 * server-side na (nooit de client vertrouwen), maakt een echte Square Order
 * aan, en levert voor online betalen een Square-hosted Checkout-link.
 *
 * Bewust geen eigen orders-tabel - Square blijft de enige bron van waarheid
 * voor bestellingen (zie app/(winkel)/account/bestellingen/page.tsx).
 */

export interface BestelRegel {
  slug: string;
  variantId?: string;
  aantal: number;
}

export interface Contactgegevens {
  voornaam: string;
  achternaam: string;
  telefoon: string;
  email: string;
}

export interface Bezorgadres {
  straat: string;
  wijk?: string;
  plaats: string;
  opmerking?: string;
}

export type Betaalwijze = "contant" | "overschrijving" | "pin" | "online";
export type Bezorgwijze = "bezorgen" | "afhalen";

export interface MaakBestellingInput {
  userId?: string;
  regels: BestelRegel[];
  contact: Contactgegevens;
  bezorgwijze: Bezorgwijze;
  adres?: Bezorgadres;
  betaalwijze: Betaalwijze;
  kortingscode?: string | null;
}

export interface MaakBestellingResultaat {
  orderId: string;
  /** Alleen gezet bij betaalwijze "online": stuur de koper hierheen om te betalen. */
  checkoutUrl?: string;
}

export class BestellingFout extends Error {}

/**
 * Square eist een geldig, internationaal telefoonnummer (E.164). Het
 * formulier vraagt een lokaal nummer (placeholder "8xx-xxxx"), dus een
 * nummer zonder landcode krijgt Suriname's +597 ervoor.
 */
function normaliseerTelefoon(ruw: string): string | undefined {
  const cijfers = ruw.replace(/[^\d+]/g, "");
  if (!cijfers) return undefined;
  if (cijfers.startsWith("+")) return cijfers;
  return `+597${cijfers.replace(/^0+/, "")}`;
}

async function vindOfMaakSquareKlant(userId: string | undefined, contact: Contactgegevens): Promise<string | undefined> {
  const client = squareClient();

  if (userId) {
    const [gebruiker] = await db
      .select({ squareCustomerId: users.squareCustomerId })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    if (gebruiker?.squareCustomerId) return gebruiker.squareCustomerId;
  }

  try {
    const res = await client.customers.create({
      givenName: contact.voornaam,
      familyName: contact.achternaam,
      emailAddress: contact.email || undefined,
      phoneNumber: normaliseerTelefoon(contact.telefoon),
      referenceId: userId,
    });
    const klantId = res.customer?.id;
    if (klantId && userId) {
      await db.update(users).set({ squareCustomerId: klantId }).where(eq(users.id, userId));
    }
    return klantId;
  } catch (err) {
    // Een Square-klant is nuttig (koppelt bestelgeschiedenis) maar niet
    // essentieel voor de bestelling zelf - de order kan ook zonder customerId.
    console.error("Square klant aanmaken mislukt:", err);
    return undefined;
  }
}

function zoekKortingscode(code: string) {
  return kortingscodes.find((k) => k.code === code.trim().toUpperCase());
}

export async function maakBestelling(input: MaakBestellingInput): Promise<MaakBestellingResultaat> {
  const { producten } = await catalogus();
  const client = squareClient();
  const locationId = squareLocationId();

  // Prijzen en beschikbaarheid opnieuw opzoeken in de echte, live catalogus -
  // de client stuurt alleen slug + variantId + aantal, nooit een prijs.
  const lineItems: { name: string; quantity: string; catalogObjectId?: string; basePriceMoney?: { amount: bigint; currency: string } }[] = [];
  let subtotaalCenten = 0;

  for (const regel of input.regels) {
    const product = producten.find((p) => p.slug === regel.slug);
    if (!product) continue;
    const variant = regel.variantId ? product.varianten.find((v) => v.id === regel.variantId) : undefined;
    const stukprijs = variant?.prijs ?? product.prijs;
    const aantal = Math.max(1, Math.min(10, Math.round(regel.aantal)));
    const centen = Math.round(stukprijs * 100);
    subtotaalCenten += centen * aantal;

    lineItems.push({
      name: variant ? `${product.naam} - ${variant.naam}` : product.naam,
      quantity: String(aantal),
      basePriceMoney: { amount: BigInt(centen), currency: "USD" },
    });
  }

  if (lineItems.length === 0) {
    throw new BestellingFout("De winkelwagen is leeg.");
  }

  const discounts: { name: string; percentage?: string; amountMoney?: { amount: bigint; currency: string }; scope: "ORDER" }[] = [];
  if (input.kortingscode) {
    const code = zoekKortingscode(input.kortingscode);
    if (code && (!code.vanaf || subtotaalCenten / 100 >= code.vanaf)) {
      if (code.soort === "percentage") {
        discounts.push({ name: code.omschrijving, percentage: String(code.waarde), scope: "ORDER" });
      } else if (code.soort === "bedrag") {
        discounts.push({
          name: code.omschrijving,
          amountMoney: { amount: BigInt(Math.round(code.waarde * 100)), currency: "USD" },
          scope: "ORDER",
        });
      }
    }
  }

  const klantId = await vindOfMaakSquareKlant(input.userId, input.contact);

  const fulfillments =
    input.bezorgwijze === "afhalen"
      ? [
          {
            type: "PICKUP" as const,
            state: "PROPOSED" as const,
            pickupDetails: {
              recipient: {
                displayName: `${input.contact.voornaam} ${input.contact.achternaam}`.trim(),
                phoneNumber: normaliseerTelefoon(input.contact.telefoon),
              },
              // ASAP i.p.v. een geplande tijd: UKM verwerkt afhaalorders
              // dezelfde dag, geen tijdslot-planning op de site.
              scheduleType: "ASAP" as const,
            },
          },
        ]
      : [
          {
            type: "DELIVERY" as const,
            state: "PROPOSED" as const,
            deliveryDetails: {
              recipient: {
                displayName: `${input.contact.voornaam} ${input.contact.achternaam}`.trim(),
                phoneNumber: normaliseerTelefoon(input.contact.telefoon),
                address: input.adres
                  ? {
                      addressLine1: input.adres.straat,
                      addressLine2: input.adres.wijk,
                      locality: input.adres.plaats,
                      country: "SR",
                    }
                  : undefined,
              },
              // ASAP i.p.v. een geplande tijd: UKM plant geen bezorgvensters
              // op de site, bestellingen gaan dezelfde dag/volgende dag uit.
              scheduleType: "ASAP" as const,
              note: input.adres?.opmerking,
            },
          },
        ];

  const orderPayload = {
    locationId,
    customerId: klantId,
    referenceId: input.userId,
    lineItems: lineItems as never,
    discounts: discounts.length > 0 ? (discounts as never) : undefined,
    fulfillments: fulfillments as never,
    metadata: { betaalwijze: input.betaalwijze },
  };

  if (input.betaalwijze === "online") {
    const res = await client.checkout.paymentLinks.create({
      idempotencyKey: crypto.randomUUID(),
      order: orderPayload as never,
      checkoutOptions: {
        redirectUrl: `${siteUrl}/afrekenen/bevestiging`,
        askForShippingAddress: false,
      },
    });
    const orderId = res.paymentLink?.orderId;
    const checkoutUrl = res.paymentLink?.url;
    if (!orderId || !checkoutUrl) {
      throw new BestellingFout("Square kon geen betaallink aanmaken.");
    }
    return { orderId, checkoutUrl };
  }

  const res = await client.orders.create({
    idempotencyKey: crypto.randomUUID(),
    order: orderPayload as never,
  });
  const orderId = res.order?.id;
  if (!orderId) {
    throw new BestellingFout("Square kon de bestelling niet aanmaken.");
  }
  return { orderId };
}

export interface BestellingOverzicht {
  id: string;
  status: string | undefined;
  totaal: number;
  regels: { naam: string; aantal: number; totaal: number }[];
}

/** Haalt een bestelling opnieuw op bij Square - de bevestigingspagina vertrouwt nooit alleen op redirect-parameters. */
export async function haalBestellingOp(orderId: string): Promise<BestellingOverzicht | undefined> {
  const client = squareClient();
  const res = await client.orders.get({ orderId });
  const order = res.order;
  if (!order) return undefined;

  return {
    id: order.id ?? orderId,
    status: order.state,
    totaal: order.totalMoney?.amount ? Number(order.totalMoney.amount) / 100 : 0,
    regels: (order.lineItems ?? []).map((li) => ({
      naam: li.name ?? "",
      aantal: Number(li.quantity ?? "1"),
      totaal: li.totalMoney?.amount ? Number(li.totalMoney.amount) / 100 : 0,
    })),
  };
}
