import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Gift, MapPin, MessageCircle, Truck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Onthul } from "@/components/motion/onthul";
import { Zegel } from "@/components/merk/zegel";
import { bedrijf } from "@/lib/site";
import { alleProducten } from "@/lib/square/producten";
import type { Product } from "@/types/product";
import { fotoStijl } from "@/lib/fotofocus";

const beloften = [
  { icoon: Truck, tekst: "Bezorging tot aan huis" },
  { icoon: MessageCircle, tekst: "Bestellen kan ook via WhatsApp" },
  { icoon: MapPin, tekst: `Passen aan de ${bedrijf.adres.straat}` },
];

/** Kaartje in de collage: een foto uit het assortiment met het gouden prijszegel. */
function Collagekaart({ product, foto, className }: { product: Product; foto: string; className?: string }) {
  return (
    <Link
      href={`/producten/${product.slug}`}
      className={`group absolute block w-36 rounded-2xl bg-white p-2 pb-3 shadow-zwevend transition-transform duration-500 ease-[var(--ease-uit)] hover:z-10 hover:scale-105 hover:rotate-0 sm:w-44 ${className ?? ""}`}
    >
      <span className="relative block aspect-[4/5] overflow-hidden rounded-xl bg-creme-diep">
        <Image src={foto} alt={product.naam} fill sizes="176px" style={fotoStijl(foto)} className="object-cover" />
      </span>
      <span className="mt-2.5 block px-1 font-display text-[0.8125rem] leading-tight font-semibold text-inkt">
        {product.naam}
      </span>
      <Zegel className="absolute -top-5 -right-5 size-16 sm:size-[4.5rem]">
        <span>
          <span className="block text-[0.5625rem] font-semibold tracking-[0.12em] uppercase">srd</span>
          <span className="block font-display text-lg font-bold">{product.prijs},-</span>
        </span>
      </Zegel>
    </Link>
  );
}

export async function Hero() {
  const producten = await alleProducten();
  const opSlug = (slug: string) => producten.find((p) => p.slug === slug);
  // De collage toont twee vaste modellen uit de prijslijst; ontbreken ze (bijv.
  // omdat Square een ander assortiment levert), dan valt hij terug op wat er is.
  const bril = opSlug("duo-tone-cat-eye-ptc") ?? producten.find((p) => p.soort === "bril" && p.voorraad > 0);
  // Een lens in een kleur die het lenzenblok verderop niet al toont.
  const lens = opSlug("forest-green") ?? producten.find((p) => p.soort === "lens" && p.voorraad > 0);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blush-50 via-creme to-creme">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-72 text-blush-200/70 stippen [mask-image:linear-gradient(#000,transparent)]" />
      <div aria-hidden className="pointer-events-none absolute -top-32 -right-24 size-[30rem] rounded-full bg-boter-100/70 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute top-40 -left-40 size-[28rem] rounded-full bg-salie-100/70 blur-3xl" />

      <div className="container-ukm relative grid items-center gap-14 pt-12 pb-16 lg:grid-cols-[1.05fr_1fr] lg:gap-10 lg:pt-20 lg:pb-24">
        <Onthul richting="rechts">
          <p className="inline-flex items-center gap-2 rounded-full border border-blush-200 bg-white/70 py-1.5 pr-4 pl-2 text-xs text-inkt-zacht backdrop-blur-sm">
            <span className="flex size-6 items-center justify-center rounded-full bg-blush-100 text-blush-700">
              <Gift className="size-3.5" />
            </span>
            {bedrijf.tagline} &middot; {bedrijf.taglineVertaling.toLowerCase()}
          </p>

          <h1 className="mt-6 font-display text-[2.75rem] leading-[1.02] font-semibold sm:text-6xl lg:text-[4.5rem]">
            Mooie ogen zijn het <em>mooiste cadeau.</em>
          </h1>

          <p className="mt-6 max-w-lg text-base leading-relaxed text-inkt-zacht sm:text-lg">
            Photochrome brillen, leesbrillen en zachte kleurlenzen, met zorg uitgezocht in {bedrijf.adres.stad}. Voor
            jezelf, of om iemand anders blij mee te maken.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Button asChild size="lg">
              <Link href="/producten">
                Shop de collectie
                <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-white/60">
              <Link href="/#cadeauwijzer">
                <Gift />
                Cadeau-ideeen
              </Link>
            </Button>
          </div>

          <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-3 border-t border-border/80 pt-7 text-sm text-inkt-zacht">
            {beloften.map(({ icoon: Icoon, tekst }) => (
              <li key={tekst} className="flex items-center gap-2">
                <Icoon className="size-4 text-salie-600" />
                {tekst}
              </li>
            ))}
          </ul>
        </Onthul>

        <Onthul richting="links" vertraging={0.1} className="relative mx-auto w-full max-w-md lg:max-w-none">
          <div className="relative mx-auto w-[78%] sm:w-[70%]">
            {/* Boogvormig hoofdbeeld, als een etalageraam. */}
            <div className="relative aspect-[3/4] overflow-hidden rounded-t-full rounded-b-[2rem] bg-creme-diep shadow-zwevend ring-8 ring-white">
              <Image
                src="/producten/nov26/dames/dames-p026-1.webp"
                alt="Klant met een Glitter Round PTC-bril van UKM.sr"
                fill
                priority
                sizes="(min-width: 1024px) 30vw, 70vw"
                style={fotoStijl("/producten/nov26/dames/dames-p026-1.webp")}
                className="object-cover"
              />
            </div>

            <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-inkt px-5 py-2 text-xs font-medium whitespace-nowrap text-creme shadow-kaart">
              Nieuw: collectie november 2026
            </span>
          </div>

          {bril ? (
            <Collagekaart
              product={bril}
              foto={bril.afbeeldingen[0]}
              className="top-6 -left-1 -rotate-6 sm:top-10 sm:left-0"
            />
          ) : null}
          {lens ? (
            <Collagekaart
              product={lens}
              foto={lens.afbeeldingen[0]}
              className="right-0 bottom-10 rotate-6 sm:-right-2 sm:bottom-16"
            />
          ) : null}
        </Onthul>
      </div>
    </section>
  );
}
