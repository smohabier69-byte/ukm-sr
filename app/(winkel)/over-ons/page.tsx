import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Eye, Heart, MapPin, ShieldCheck } from "lucide-react";

import { Paginakop } from "@/components/catalogus/paginakop";
import { Button } from "@/components/ui/button";
import { Onthul, OnthulGroep, OnthulKind } from "@/components/motion/onthul";
import { alleProducten } from "@/lib/square/producten";
import { bedrijf } from "@/lib/site";

export const metadata: Metadata = {
  title: "Over ons",
  description:
    "UKM.sr staat voor Utsukushiku Kenkōna Me: mooie, gezonde ogen. Lees waar de winkel aan de Rembrandtstraat voor staat.",
  alternates: { canonical: "/over-ons" },
};

const waarden = [
  {
    icoon: Eye,
    titel: "Bescherming eerst",
    tekst:
      "Elk montuur dat we voeren filtert blauw licht. Niet als extraatje, maar als uitgangspunt: schermtijd is voor bijna iedereen dagelijkse kost geworden.",
  },
  {
    icoon: ShieldCheck,
    titel: "Kwaliteit die je kunt nagaan",
    tekst:
      "Onze lenzen zijn FDA, GMP, ISO en CE goedgekeurd, met een houdbaarheid van zes maanden. Wat we niet zelf zouden dragen, verkopen we niet.",
  },
  {
    icoon: Heart,
    titel: "Persoonlijk advies",
    tekst:
      "Welke vorm past bij jouw gezicht, welke sterkte heb je nodig? Kom langs, pas rustig, of stuur een bericht. We denken graag mee.",
  },
];

export default async function OverOnsPagina() {
  const producten = await alleProducten();

  return (
    <>
      <Paginakop
        kruimels={[{ label: "Home", href: "/" }, { label: "Over ons" }]}
        titel="Mooie, gezonde ogen"
        tekst={`${bedrijf.tagline} is Japans voor "${bedrijf.taglineVertaling.toLowerCase()}". Die twee woorden vatten samen waarom we deze winkel zijn begonnen.`}
      />

      <section className="container-ukm grid items-center gap-12 py-14 lg:grid-cols-2 lg:gap-16 lg:py-20">
        <Onthul>
          <h2 className="font-display text-3xl font-bold sm:text-4xl">Waar het mee begon</h2>
          <div className="mt-6 space-y-5 leading-relaxed text-inkt-zacht">
            <p>
              We zagen om ons heen hetzelfde gebeuren: mensen die de hele dag naar een scherm keken en tegen de avond
              last kregen van vermoeide ogen, hoofdpijn of slecht slapen. Een bril die daar iets aan doet was in
              Suriname niet makkelijk te vinden, en als je er een vond, was het zelden een montuur dat je met plezier
              opzette.
            </p>
            <p>
              Daar wilden we verandering in brengen. Geen keuze tussen bescherming en stijl, maar allebei. Inmiddels
              voeren we {producten.length} modellen: heldere anti-blauwlicht brillen, photochrome PTC-monturen die
              buiten donker kleuren, en zachte kleurlenzen met en zonder sterkte.
            </p>
            <p>
              Alles wat we verkopen ligt in de winkel aan de {bedrijf.adres.straat}. Je kunt er langskomen, passen en
              vragen stellen. Wat je online ziet, is precies wat er in de kast ligt.
            </p>
          </div>
        </Onthul>

        <Onthul richting="links" vertraging={0.1}>
          <div className="grid grid-cols-2 gap-4">
            <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-creme-diep">
              <Image
                src="/producten/brillen/brillen-p059-2.jpg"
                alt="Model draagt een photochrome cat eye van UKM.sr"
                fill
                sizes="(min-width: 1024px) 22vw, 45vw"
                className="object-cover object-top"
              />
            </div>
            <div className="relative mt-8 aspect-[3/4] overflow-hidden rounded-2xl bg-creme-diep">
              <Image
                src="/producten/lenzen/lenzen-p020-1.jpg"
                alt="Kleurlens uit de Soft Lenses collectie"
                fill
                sizes="(min-width: 1024px) 22vw, 45vw"
                className="object-cover object-top"
              />
            </div>
          </div>
        </Onthul>
      </section>

      <section className="bg-salie-50/70 py-14 lg:py-20">
        <div className="container-ukm">
          <Onthul className="mb-12 max-w-2xl">
            <h2 className="font-display text-3xl font-bold sm:text-4xl">Waar we op letten</h2>
          </Onthul>

          <OnthulGroep className="grid gap-5 md:grid-cols-3">
            {waarden.map((waarde) => (
              <OnthulKind key={waarde.titel}>
                <div className="flex h-full flex-col rounded-2xl border border-border/70 bg-white p-7">
                  <span className="flex size-11 items-center justify-center rounded-full bg-salie-100 text-salie-700">
                    <waarde.icoon className="size-5" />
                  </span>
                  <h3 className="mt-5 font-display text-lg font-semibold">{waarde.titel}</h3>
                  <p className="mt-3 leading-relaxed text-inkt-zacht">{waarde.tekst}</p>
                </div>
              </OnthulKind>
            ))}
          </OnthulGroep>
        </div>
      </section>

      <section className="container-ukm py-14 lg:py-20">
        <Onthul className="overflow-hidden rounded-3xl bg-inkt px-8 py-14 text-center sm:px-12">
          <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-white/12 text-creme">
            <MapPin className="size-5" />
          </span>
          <h2 className="mt-6 font-display text-3xl font-bold text-creme sm:text-4xl">Kom gerust langs</h2>
          <p className="mx-auto mt-4 max-w-lg leading-relaxed text-creme/70">
            {bedrijf.adres.straat}, {bedrijf.adres.stad}. Van maandag tot en met vrijdag van 10:00 tot 18:00, op
            zaterdag van 09:00 tot 15:00.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" variant="wit">
              <Link href="/contact">Contact en route</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/25 text-creme hover:bg-white/10">
              <Link href="/producten">Bekijk het assortiment</Link>
            </Button>
          </div>
        </Onthul>
      </section>
    </>
  );
}
