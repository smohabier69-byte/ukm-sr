import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, MapPin, PackageCheck, Truck } from "lucide-react";

import { Galerij } from "@/components/product/galerij";
import { Koopblok } from "@/components/product/koopblok";
import { Specificatietabel } from "@/components/product/specificatietabel";
import { BeoordelingenSectie } from "@/components/product/beoordelingen-sectie";
import { VaakSamenGekocht } from "@/components/product/vaak-samen-gekocht";
import { RecentBekeken, RegistreerBezoek } from "@/components/product/recent-bekeken";
import { Productkaart } from "@/components/product/productkaart";
import { Sterren } from "@/components/product/sterren";
import { Badge } from "@/components/ui/badge";
import { Kruimelpad } from "@/components/ui/kruimelpad";
import { Onthul } from "@/components/motion/onthul";
import { gerelateerdeProducten, producten, productOpSlug, vaakSamenGekocht } from "@/data/producten";
import { merkOpSlug } from "@/data/merken";
import { categorieOpSlug } from "@/data/categorieen";
import { beoordelingenVoor } from "@/data/beoordelingen";
import { formatPrijs } from "@/lib/format";
import { bedrijf } from "@/lib/site";

export function generateStaticParams() {
  return producten.map((product) => ({ slug: product.slug }));
}

/** De catalogus ligt vast bij het bouwen, dus een onbekende slug geeft een echte 404. */
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = productOpSlug(slug);
  if (!product) return { title: "Product niet gevonden" };

  return {
    title: product.naam,
    description: `${product.korteBeschrijving} ${formatPrijs(product.prijs)} bij UKM.sr in Paramaribo.`,
    alternates: { canonical: `/producten/${slug}` },
    openGraph: {
      type: "website",
      title: `${product.naam} | UKM.sr`,
      description: product.korteBeschrijving,
      images: product.afbeeldingen.slice(0, 3).map((url) => ({ url })),
    },
  };
}

export default async function Productpagina({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = productOpSlug(slug);
  if (!product) notFound();

  const merk = merkOpSlug(product.merk);
  const categorie = categorieOpSlug(product.categorie);
  const combinaties = vaakSamenGekocht(product);
  const gerelateerd = gerelateerdeProducten(product, 4);
  const beoordelingen = beoordelingenVoor(product);

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.naam,
    description: product.beschrijving,
    image: product.afbeeldingen,
    sku: product.id,
    brand: { "@type": "Brand", name: merk?.naam ?? bedrijf.naam },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.score,
      reviewCount: product.aantalBeoordelingen,
      bestRating: 5,
    },
    review: beoordelingen.slice(0, 3).map((b) => ({
      "@type": "Review",
      author: { "@type": "Person", name: b.naam },
      datePublished: b.datum,
      name: b.titel,
      reviewBody: b.tekst,
      reviewRating: { "@type": "Rating", ratingValue: b.score, bestRating: 5 },
    })),
    offers: {
      "@type": "Offer",
      priceCurrency: "SRD",
      price: product.prijs,
      availability: product.voorraad > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: { "@type": "Organization", name: bedrijf.naam },
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      <RegistreerBezoek slug={product.slug} />

      <div className="container-ukm pt-8">
        <Kruimelpad
          kruimels={[
            { label: "Home", href: "/" },
            { label: product.soort === "bril" ? "Brillen" : "Lenzen", href: `/categorie/${product.soort === "bril" ? "brillen" : "lenzen"}` },
            ...(categorie ? [{ label: categorie.naam, href: `/categorie/${categorie.slug}` }] : []),
            { label: product.naam },
          ]}
        />
      </div>

      <section className="container-ukm grid gap-10 py-8 lg:grid-cols-2 lg:gap-16 lg:py-12">
        <Galerij
          afbeeldingen={product.afbeeldingen}
          naam={product.naam}
          labels={
            <>
              {product.vanPrijs ? <Badge variant="korting" size="sm">Aanbieding</Badge> : null}
              {product.labels.includes("nieuw") ? <Badge variant="nieuw" size="sm">Nieuw</Badge> : null}
              {product.techniek === "ptc" ? <Badge variant="wit" size="sm">PTC photochroom</Badge> : null}
            </>
          }
        />

        <div>
          {merk ? (
            <Link
              href={`/merken/${merk.slug}`}
              className="text-sm font-medium text-salie-700 transition-colors hover:text-salie-800"
            >
              {merk.naam}
            </Link>
          ) : null}

          <h1 className="mt-2 font-display text-3xl font-bold sm:text-4xl">{product.naam}</h1>

          <p className="mt-1.5 text-sm text-inkt-zacht">
            Uit de prijslijst als &ldquo;{product.catalogusnaam}&rdquo;
          </p>

          <a href="#beoordelingen" className="mt-4 inline-flex">
            <Sterren score={product.score} aantal={product.aantalBeoordelingen} />
          </a>

          <p className="mt-5 leading-relaxed text-inkt-zacht">{product.korteBeschrijving}</p>

          <div className="mt-8">
            <Koopblok product={product} />
          </div>

          <ul className="mt-8 grid gap-2.5 border-t border-border pt-7 sm:grid-cols-2">
            {product.kenmerken.map((kenmerk) => (
              <li key={kenmerk} className="flex items-start gap-2.5 text-sm">
                <Check className="mt-0.5 size-4 shrink-0 text-salie-600" />
                <span className="text-inkt-zacht">{kenmerk}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="container-ukm py-10">
        <VaakSamenGekocht hoofdproduct={product} suggesties={combinaties} />
      </section>

      <section className="container-ukm grid gap-12 py-10 lg:grid-cols-2 lg:gap-16 lg:py-14">
        <Onthul>
          <h2 className="font-display text-2xl font-bold">Over dit model</h2>
          <p className="mt-5 leading-relaxed text-inkt-zacht">{product.beschrijving}</p>

          <div className="mt-8 rounded-2xl bg-salie-50 p-6">
            <h3 className="flex items-center gap-2 font-display text-base font-semibold">
              <Truck className="size-4 text-salie-700" />
              Bezorging en afhalen
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-inkt-zacht">
              <li className="flex items-start gap-2.5">
                <PackageCheck className="mt-0.5 size-4 shrink-0 text-salie-600" />
                Bezorging door heel {bedrijf.adres.stad} vanaf {formatPrijs(bedrijf.bezorgingVanaf)}, gratis vanaf{" "}
                {formatPrijs(bedrijf.gratisBezorgingVanaf)}.
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 size-4 shrink-0 text-salie-600" />
                Zelf afhalen kan aan de {bedrijf.adres.straat}, {bedrijf.openingstijden[0].dagen.toLowerCase()}{" "}
                {bedrijf.openingstijden[0].tijden}.
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="mt-0.5 size-4 shrink-0 text-salie-600" />
                Betalen met contant, bankoverschrijving of pin.
              </li>
            </ul>
          </div>
        </Onthul>

        <Onthul vertraging={0.08}>
          <h2 className="font-display text-2xl font-bold">Specificaties</h2>
          <div className="mt-5">
            <Specificatietabel specificaties={product.specificaties} />
          </div>
          <p className="mt-4 text-xs text-inkt-zacht">Bron: {product.bron}.</p>
        </Onthul>
      </section>

      <section id="beoordelingen" className="container-ukm scroll-mt-28 py-10 lg:py-14">
        <h2 className="mb-10 font-display text-2xl font-bold sm:text-3xl">Beoordelingen</h2>
        <BeoordelingenSectie product={product} />
      </section>

      {gerelateerd.length > 0 ? (
        <section className="container-ukm py-10 lg:py-14">
          <h2 className="mb-10 font-display text-2xl font-bold sm:text-3xl">Vergelijkbare modellen</h2>
          <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
            {gerelateerd.map((ander) => (
              <Productkaart key={ander.id} product={ander} />
            ))}
          </div>
        </section>
      ) : null}

      <RecentBekeken huidigeSlug={product.slug} />
    </>
  );
}
