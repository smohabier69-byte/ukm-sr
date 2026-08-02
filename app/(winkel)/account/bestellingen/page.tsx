import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { MessageCircle, PackageSearch } from "lucide-react";

import { Paginakop } from "@/components/catalogus/paginakop";
import { Button } from "@/components/ui/button";
import { auth } from "@/auth";
import { squareClient, squareLocationId } from "@/lib/square/client";
import { formatPrijs } from "@/lib/format";
import { whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Mijn bestellingen",
  robots: { index: false, follow: true },
};

interface Bestellingsregel {
  id: string;
  datum: string | undefined;
  status: string | undefined;
  totaal: number;
}

/**
 * Bestellingen komen rechtstreeks uit Square op - er is bewust geen eigen
 * orders-tabel. Zolang er nog geen echte kassakoppeling is (Fase 6), heeft
 * geen enkel account een squareCustomerId en toont deze pagina dus altijd
 * de lege staat. Dat is verwacht gedrag, geen bug.
 */
async function haalBestellingenOp(squareCustomerId: string): Promise<Bestellingsregel[]> {
  try {
    const client = squareClient();
    const res = await client.orders.search({
      locationIds: [squareLocationId()],
      query: { filter: { customerFilter: { customerIds: [squareCustomerId] } } },
    });
    return (res.orders ?? []).map((order) => ({
      id: order.id ?? "",
      datum: order.createdAt,
      status: order.state,
      totaal: order.totalMoney?.amount ? Number(order.totalMoney.amount) / 100 : 0,
    }));
  } catch {
    return [];
  }
}

export default async function BestellingenPagina() {
  const sessie = await auth();
  if (!sessie?.user) redirect("/account/inloggen");

  const bestellingen = sessie.user.squareCustomerId
    ? await haalBestellingenOp(sessie.user.squareCustomerId)
    : [];

  return (
    <>
      <Paginakop
        kruimels={[{ label: "Home", href: "/" }, { label: "Mijn account", href: "/account" }, { label: "Bestellingen" }]}
        titel="Mijn bestellingen"
      />

      <section className="container-ukm py-10 lg:py-14">
        {bestellingen.length === 0 ? (
          <div className="flex flex-col items-center rounded-3xl border border-dashed border-border bg-white/60 px-6 py-20 text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-salie-100 text-salie-700">
              <PackageSearch className="size-6" />
            </span>
            <h2 className="mt-6 font-display text-xl font-semibold">Nog geen bestellingen</h2>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-inkt-zacht">
              Bestellingen die je via de website plaatst, verschijnen hier automatisch. Al besteld via WhatsApp of
              in de winkel? Vraag naar de status met je bestelnummer bij de hand.
            </p>
            <Button asChild variant="outline" className="mt-7">
              <a
                href={whatsappLink("Goedendag, ik wil graag de status van mijn bestelling weten.")}
                target="_blank"
                rel="noreferrer noopener"
              >
                <MessageCircle />
                Vraag naar je bestelling
              </a>
            </Button>
          </div>
        ) : (
          <ul className="divide-y divide-border border-y border-border">
            {bestellingen.map((bestelling) => (
              <li key={bestelling.id} className="flex items-center justify-between gap-4 py-5">
                <div>
                  <p className="font-medium">Bestelling {bestelling.id.slice(0, 8)}</p>
                  <p className="text-sm text-inkt-zacht">{bestelling.status}</p>
                </div>
                <p className="font-display font-semibold">{formatPrijs(bestelling.totaal)}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
