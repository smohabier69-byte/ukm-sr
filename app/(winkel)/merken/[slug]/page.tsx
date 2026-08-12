import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";

import { Paginakop } from "@/components/catalogus/paginakop";
import { ProductBrowser } from "@/components/catalogus/product-browser";
import { ProductBrowserVanafUrl } from "@/components/catalogus/product-browser-vanaf-url";
import { merken } from "@/data/merken";
import { merkOpSlug } from "@/lib/square/merken";
import { productenVanMerk } from "@/lib/square/producten";
import { bouwFacetten, uitZoekparameters } from "@/lib/catalogus";

export function generateStaticParams() {
  return merken.map((merk) => ({ slug: merk.slug }));
}

/** Alle huislijnen staan vast; een onbekende slug hoort een echte 404 te geven. */
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const merk = await merkOpSlug(slug);
  if (!merk) return { title: "Merk niet gevonden" };

  return {
    title: merk.naam,
    description: merk.omschrijving,
    alternates: { canonical: `/merken/${slug}` },
  };
}

export default async function Merkpagina({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const merk = await merkOpSlug(slug);
  if (!merk) notFound();

  const lijst = await productenVanMerk(slug);
  const facetten = bouwFacetten(lijst);

  return (
    <>
      <Paginakop
        kruimels={[
          { label: "Home", href: "/" },
          { label: "Merken", href: "/merken" },
          { label: merk.naam },
        ]}
        titel={merk.naam}
        tekst={merk.omschrijving}
        afbeelding={lijst[0]?.afbeeldingen[0]}
        aantal={lijst.length}
      />

      <section className="container-ukm py-10 lg:py-14">
        <Suspense fallback={<ProductBrowser producten={lijst} beginstaat={uitZoekparameters({}, facetten)} />}>
          <ProductBrowserVanafUrl producten={lijst} />
        </Suspense>
      </section>
    </>
  );
}
