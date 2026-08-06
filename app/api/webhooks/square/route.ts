import { NextResponse } from "next/server";
import crypto from "node:crypto";

import { squareClient } from "@/lib/square/client";
import { resendClient } from "@/lib/email/client";
import { bedrijf, siteUrl } from "@/lib/site";

/**
 * Ontvangt order.updated/payment.updated van Square - de gezaghebbende
 * bevestiging dat een online betaling is afgerond (dekt ook het geval dat de
 * koper het tabblad sluit tijdens de Square-redirect). Stuurt de
 * bevestigingsmail; er is bewust geen eigen orders-tabel om bij te werken.
 *
 * Registratie (webhook-abonnement aanmaken bij Square, gekoppeld aan de
 * live URL) gebeurt pas bij de Fase 9-cutover, zodra er een publiek
 * bereikbare productie-URL is - zie docs/square-mapping-notes.md.
 */

function verifieerSignature(ruweBody: string, signature: string | null, notificatieUrl: string): boolean {
  const sleutel = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;
  if (!sleutel || !signature) return false;

  const hmac = crypto.createHmac("sha256", sleutel);
  hmac.update(notificatieUrl + ruweBody);
  const verwacht = hmac.digest("base64");

  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(verwacht));
  } catch {
    return false;
  }
}

/**
 * Best-effort ontdubbeling binnen dezelfde serverless-instantie. Op Vercel
 * overleeft dit geen koude start, dus dit voorkomt geen dubbele mail
 * gegarandeerd - alleen een dure of destructieve actie zou hier een echte
 * (database-)ontdubbeling nodig hebben. Een tweede bevestigingsmail is geen
 * incident.
 */
const verwerkteEvents = new Set<string>();

export async function POST(request: Request) {
  const ruweBody = await request.text();
  const signature = request.headers.get("x-square-hmacsha256-signature");
  const notificatieUrl = `${siteUrl}/api/webhooks/square`;

  if (!verifieerSignature(ruweBody, signature, notificatieUrl)) {
    return NextResponse.json({ fout: "Ongeldige signature." }, { status: 401 });
  }

  const event = JSON.parse(ruweBody) as {
    event_id?: string;
    type?: string;
    data?: { object?: { payment?: { order_id?: string; status?: string }; order?: { id?: string; state?: string } } };
  };

  // Square kan hetzelfde event meerdere keren afleveren; eenmalig verwerken.
  if (event.event_id) {
    if (verwerkteEvents.has(event.event_id)) return NextResponse.json({ ontvangen: true });
    verwerkteEvents.add(event.event_id);
  }

  try {
    if (event.type === "payment.updated" && event.data?.object?.payment?.status === "COMPLETED") {
      const orderId = event.data.object.payment.order_id;
      if (orderId) await stuurBevestigingsmail(orderId);
    }
  } catch (err) {
    // De bevestigingsmail is een service, geen kernfunctie - een fout hierin
    // mag Square niet aanzetten tot eindeloos herhalen van het event.
    console.error("Webhookverwerking mislukt:", err);
  }

  return NextResponse.json({ ontvangen: true });
}

async function stuurBevestigingsmail(orderId: string) {
  const client = squareClient();
  const res = await client.orders.get({ orderId });
  const order = res.order;
  if (!order) return;

  let email: string | undefined;
  if (order.customerId) {
    try {
      const klant = await client.customers.get({ customerId: order.customerId });
      email = klant.customer?.emailAddress ?? undefined;
    } catch {
      // Geen klantprofiel gevonden - dan kan er geen mail worden gestuurd, geen harde fout.
    }
  }
  if (!email) return;

  const regels = (order.lineItems ?? [])
    .map((li) => `<li>${li.quantity}&times; ${li.name}</li>`)
    .join("");
  const totaal = order.totalMoney?.amount ? (Number(order.totalMoney.amount) / 100).toFixed(2) : "0.00";

  try {
    const resend = resendClient();
    await resend.emails.send({
      from: `${bedrijf.naam} <noreply@${new URL(siteUrl).hostname}>`,
      to: email,
      subject: "Betaling ontvangen - bedankt voor je bestelling",
      html: `<p>We hebben je betaling ontvangen voor bestelling ${orderId.slice(0, 8).toUpperCase()}.</p><ul>${regels}</ul><p>Totaal: ${totaal}</p>`,
    });
  } catch {
    console.log(`[bevestigingsmail] RESEND_API_KEY ontbreekt. Zou verstuurd zijn naar ${email} voor order ${orderId}.`);
  }
}
