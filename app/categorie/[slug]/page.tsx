import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Paginakop } from "@/components/catalogus/paginakop";
import { ProductBrowser } from "@/components/catalogus/product-browser";
import { alleCategorieSlugs, categoriecontext, hoofdcategorieen } from "@/data/categorieen";
import { producten } from "@/data/producten";
import { bouwFacetten, uitZoekparameters } from "@/lib/catalogus";

export function generateStaticParams() {
  return alleCategorieSlugs.map((slug) => ({ slug }));
}

/**
 * Het aantal categorieen ligt vast bij het bouwen. Door hier geen andere
 * waarden toe te laten geeft een onbekende slug een echte 404 in plaats van
 * een pagina met foutmelding en statuscode 200.
 */
export const dynamicParams = false;

/**
 * Een overkoepelende ingang zoals "Brillen" bevat alles van die soort; een
 * losse collectie zoals "PTC" alleen de eigen categorie.
 */
function productenVoor(slug: string) {
  const context = categoriecontext(slug);
  if (!context) return [];
  return context.isHoofdcategorie
    ? producten.filter((p) => p.soort === context.soort)
    : producten.filter((p) => p.categorie === slug);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const context = categoriecontext(slug);
  if (!context) return { title: "Categorie niet gevonden" };

  return {
    title: context.naam,
    description: context.omschrijving,
    alternates: { canonical: `/categorie/${slug}` },
    openGraph: {
      title: `${context.naam} | UKM.sr`,
      description: context.omschrijving,
      images: [{ url: context.afbeelding }],
    },
  };
}

export default async function Categoriepagina({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const context = categoriecontext(slug);
  if (!context) notFound();

  const lijst = productenVoor(slug);
  const facetten = bouwFacetten(lijst);
  const beginstaat = uitZoekparameters(await searchParams, facetten);

  const hoofd = hoofdcategorieen.find((c) => c.soort === context.soort);
  const kruimels = context.isHoofdcategorie
    ? [{ label: "Home", href: "/" }, { label: context.naam }]
    : [
        { label: "Home", href: "/" },
        ...(hoofd ? [{ label: hoofd.naam, href: `/categorie/${hoofd.slug}` }] : []),
        { label: context.naam },
      ];

  return (
    <>
      <Paginakop
        kruimels={kruimels}
        titel={context.naam}
        tekst={context.omschrijving}
        afbeelding={context.afbeelding}
        aantal={lijst.length}
      />

      <section className="container-ukm py-10 lg:py-14">
        <ProductBrowser producten={lijst} beginstaat={beginstaat} />
      </section>
    </>
  );
}
