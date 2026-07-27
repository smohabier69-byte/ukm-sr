import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Clock, User } from "lucide-react";

import { Kruimelpad } from "@/components/ui/kruimelpad";
import { ProductVideoShowcase } from "@/components/media/product-video-showcase";
import { MediaKaart } from "@/components/media/media-kaart";
import { Onthul, OnthulGroep, OnthulKind } from "@/components/motion/onthul";
import { gesorteerdeMedia, mediaItems, mediaOpSlug } from "@/data/media";
import { formatDatumLang } from "@/lib/format";

export function generateStaticParams() {
  return mediaItems.map((item) => ({ slug: item.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const item = mediaOpSlug(slug);
  if (!item) return { title: "Niet gevonden" };

  return {
    title: item.titel,
    description: item.samenvatting,
    alternates: { canonical: `/media/${slug}` },
    openGraph: { title: item.titel, description: item.samenvatting, images: [{ url: item.omslag }] },
  };
}

export default async function MediaDetailpagina({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = mediaOpSlug(slug);
  if (!item) notFound();

  const overige = gesorteerdeMedia()
    .filter((ander) => ander.slug !== item.slug)
    .slice(0, 3);

  return (
    <>
      <div className="container-ukm pt-8">
        <Kruimelpad kruimels={[{ label: "Home", href: "/" }, { label: "Media", href: "/media" }, { label: item.titel }]} />
      </div>

      <article className="container-ukm py-8 lg:py-12">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs text-inkt-zacht">{formatDatumLang(item.gepubliceerdOp)}</p>
          <h1 className="mt-3 font-display text-3xl font-bold sm:text-4xl">{item.titel}</h1>
          <p className="mt-4 leading-relaxed text-inkt-zacht">{item.samenvatting}</p>

          {item.soort === "artikel" && (item.auteur ?? item.leestijdMinuten) ? (
            <div className="mt-4 flex items-center justify-center gap-4 text-xs text-inkt-zacht">
              {item.auteur ? (
                <span className="flex items-center gap-1.5">
                  <User className="size-3.5" />
                  {item.auteur}
                </span>
              ) : null}
              {item.leestijdMinuten ? (
                <span className="flex items-center gap-1.5">
                  <Clock className="size-3.5" />
                  {item.leestijdMinuten} min. leestijd
                </span>
              ) : null}
            </div>
          ) : null}
        </div>

        <Onthul className="mt-10">
          {item.soort === "video" ? (
            <ProductVideoShowcase
              bron={item.videoBron}
              poster={item.omslag}
              titel={item.titel}
              className="max-w-md"
            />
          ) : (
            <div className="prose-ukm mx-auto">
              {item.inhoud.map((alinea, i) => (
                <p key={i}>{alinea}</p>
              ))}
            </div>
          )}
        </Onthul>
      </article>

      {overige.length > 0 ? (
        <section className="container-ukm py-10 lg:py-14">
          <h2 className="mb-8 font-display text-2xl font-bold">Meer media</h2>
          <OnthulGroep className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {overige.map((ander) => (
              <OnthulKind key={ander.slug}>
                <MediaKaart item={ander} />
              </OnthulKind>
            ))}
          </OnthulGroep>
        </section>
      ) : null}
    </>
  );
}
