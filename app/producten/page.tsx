import type { Metadata } from "next";

import { Paginakop } from "@/components/catalogus/paginakop";
import { ProductBrowser } from "@/components/catalogus/product-browser";
import { producten } from "@/data/producten";
import { bouwFacetten, uitZoekparameters } from "@/lib/catalogus";

export const metadata: Metadata = {
  title: "Alle producten",
  description:
    "Het volledige assortiment van UKM.sr: anti-blauwlicht brillen, photochrome PTC-monturen, kinderbrillen en kleurlenzen met en zonder sterkte.",
  alternates: { canonical: "/producten" },
};

export default async function Productenpagina({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const facetten = bouwFacetten(producten);
  const beginstaat = uitZoekparameters(params, facetten);

  return (
    <>
      <Paginakop
        kruimels={[{ label: "Home", href: "/" }, { label: "Alle producten" }]}
        titel="Alle producten"
        tekst="Brillen en lenzen uit beide prijslijsten, bij elkaar op een pagina. Filter op techniek, vorm, kleur of prijs."
        aantal={producten.length}
      />

      <section className="container-ukm py-10 lg:py-14">
        <ProductBrowser producten={producten} beginstaat={beginstaat} />
      </section>
    </>
  );
}
