import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Onthul } from "@/components/motion/onthul";
import { bedrijf } from "@/lib/site";
import { alleProducten } from "@/lib/square/producten";

export async function Hero() {
  const producten = await alleProducten();
  const kerncijfers = [
    { waarde: `${producten.length}+`, label: "Modellen op voorraad" },
    { waarde: "UV400", label: "Bescherming op PTC" },
    { waarde: "6 mnd", label: "Houdbaarheid lenzen" },
  ];

  return (
    <section className="relative overflow-hidden">
      {/* Zachte saliegloed achter de tekstkolom. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -left-40 size-[36rem] rounded-full bg-salie-200/35 blur-3xl"
      />

      <div className="container-ukm relative grid items-center gap-12 py-14 lg:grid-cols-2 lg:gap-16 lg:py-24">
        <Onthul richting="rechts" className="order-2 lg:order-1">
          <Badge variant="zacht" className="mb-6">
            {bedrijf.tagline} &middot; {bedrijf.taglineVertaling}
          </Badge>

          <h1 className="font-display text-[2.5rem] leading-[1.04] font-extrabold sm:text-6xl lg:text-[4.25rem]">
            Bescherm je ogen.
            <span className="block text-salie-600">Zonder in te leveren op stijl.</span>
          </h1>

          <p className="mt-6 max-w-lg text-base leading-relaxed text-inkt-zacht sm:text-lg">
            Anti-blauwlicht brillen, photochrome PTC-monturen en zachte kleurlenzen. Zorgvuldig geselecteerd,
            persoonlijk gepast aan de {bedrijf.adres.straat} en bezorgd door heel {bedrijf.adres.stad}.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Button asChild size="lg">
              <Link href="/categorie/brillen">
                Bekijk de collectie
                <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/categorie/ptc">
                <Sun />
                Ontdek PTC
              </Link>
            </Button>
          </div>

          <dl className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t border-border pt-8">
            {kerncijfers.map((cijfer) => (
              <div key={cijfer.label}>
                <dt className="sr-only">{cijfer.label}</dt>
                <dd>
                  <span className="block font-display text-2xl font-bold">{cijfer.waarde}</span>
                  <span className="mt-1 block text-xs leading-snug text-inkt-zacht">{cijfer.label}</span>
                </dd>
              </div>
            ))}
          </dl>
        </Onthul>

        <Onthul richting="links" vertraging={0.1} className="order-1 lg:order-2">
          <div className="relative">
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-creme-diep shadow-zwevend">
              <Image
                src="/producten/brillen/brillen-p059-1.jpg"
                alt="Model draagt de PTC Cat Eye Black Gold van UKM.sr"
                fill
                priority
                sizes="(min-width: 1024px) 44vw, 92vw"
                className="object-cover object-top"
              />
            </div>

            {/* Zwevende kaart met het kenmerkende PTC-verhaal. */}
            <div className="absolute -bottom-6 -left-4 w-60 rounded-2xl border border-border/70 bg-white/95 p-4 shadow-zwevend backdrop-blur-sm sm:-left-8 sm:w-72">
              <div className="flex items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-salie-100 text-salie-700">
                  <Sun className="size-4" />
                </span>
                <div>
                  <p className="font-display text-sm font-semibold">Helder binnen, donker buiten</p>
                  <p className="mt-0.5 text-xs text-inkt-zacht">Photochromic Technology Coating</p>
                </div>
              </div>
            </div>
          </div>
        </Onthul>
      </div>
    </section>
  );
}
