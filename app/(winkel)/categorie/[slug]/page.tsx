import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Paginakop } from "@/components/catalogus/paginakop";
import { ProductBrowser } from "@/components/catalogus/product-browser";
import { hoofdcategorieen, categorieen as categorieInhoud } from "@/data/categorieen";
import { categoriecontext, type Categoriecontext } from "@/lib/square/categorieen";
import { alleProducten } from "@/lib/square/producten";
import { bouwFacetten, uitZoekparameters } from "@/lib/catalogus";
import { siteUrl } from "@/lib/site";
import type { Product } from "@/types/product";

export function generateStaticParams() {
  return [...hoofdcategorieen.map((c) => c.slug), ...categorieInhoud.map((c) => c.slug)].map((slug) => ({ slug }));
}

/**
 * De catalogus staat nu in Square, maar de categorieen zelf (navigatie +
 * inhoud) blijven vast in code - dus dit blijft veilig statisch. Een
 * onbekende slug geeft nog steeds een echte 404.
 */
export const dynamicParams = false;

/**
 * Een overkoepelende ingang zoals "Brillen" bevat alles van die soort; een
 * losse collectie zoals "PTC" alleen de eigen categorie.
 */
function productenVoor(producten: Product[], slug: string, context: Categoriecontext) {
  return context.isHoofdcategorie
    ? producten.filter((p) => p.soort === context.soort)
    : producten.filter((p) => p.categorie === slug);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const context = await categoriecontext(slug);
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
  const context = await categoriecontext(slug);
  if (!context) notFound();

  const alleProductenLijst = await alleProducten();
  const lijst = productenVoor(alleProductenLijst, slug, context);
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

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: kruimels.map((kruimel, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: kruimel.label,
      ...(kruimel.href ? { item: `${siteUrl}${kruimel.href}` } : {}),
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
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
