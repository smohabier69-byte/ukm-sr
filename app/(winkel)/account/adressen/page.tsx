import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";

import { Paginakop } from "@/components/catalogus/paginakop";
import { AdressenBeheer } from "@/components/account/adressen-beheer";
import { auth } from "@/auth";
import { db } from "@/lib/db/client";
import { addresses } from "@/lib/db/schema";

export const metadata: Metadata = {
  title: "Mijn adressen",
  robots: { index: false, follow: true },
};

export default async function AdressenPagina() {
  const sessie = await auth();
  if (!sessie?.user) redirect("/account/inloggen");

  const opgeslagen = await db.select().from(addresses).where(eq(addresses.userId, sessie.user.id));

  return (
    <>
      <Paginakop
        kruimels={[{ label: "Home", href: "/" }, { label: "Mijn account", href: "/account" }, { label: "Adressen" }]}
        titel="Mijn adressen"
        tekst="Bewaar een adres om sneller af te rekenen."
      />

      <section className="container-ukm py-10 lg:py-14">
        <AdressenBeheer adressen={opgeslagen} />
      </section>
    </>
  );
}
