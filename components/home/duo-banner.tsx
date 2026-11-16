import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Onthul } from "@/components/motion/onthul";
import { Zegel } from "@/components/merk/zegel";
import { alleProducten } from "@/lib/square/producten";
import { fotoStijl } from "@/lib/fotofocus";

const banners = [
  {
    categorie: "leesbrillen",
    bovenschrift: "Leesbrillen collectie",
    titel: "Lezen zonder turen",
    tekst: "Leesbrillen met blauwlichtfilter in +1.5, +2.0, +2.5 en +3.0. Van randloos tot cat eye.",
    foto: "/producten/nov26/lees/lees-p004-1.webp",
    vlak: "bg-boter-100",
  },
  {
    categorie: "heren-unisex",
    bovenschrift: "For men & unisex",
    titel: "Ook voor hem",
    tekst: "PTC-monturen die buiten vanzelf donker kleuren, en de Night Vision-rijbril voor in het donker.",
    foto: "/producten/nov26/heren/heren-p007-1.webp",
    vlak: "bg-salie-100",
  },
] as const;

/** Twee collecties die naast de damesbrillen een eigen ingang verdienen. */
export async function DuoBanner() {
  const producten = await alleProducten();
  const zichtbaar = banners
    .map((banner) => {
      const prijzen = producten.filter((p) => p.categorie === banner.categorie).map((p) => p.prijs);
      return { ...banner, vanaf: prijzen.length ? Math.min(...prijzen) : undefined };
    })
    .filter((banner) => banner.vanaf !== undefined);

  if (zichtbaar.length === 0) return null;

  return (
    <section className="container-ukm py-14 lg:py-20">
      <div className="grid gap-5 lg:grid-cols-2">
        {zichtbaar.map((banner, i) => (
          <Onthul key={banner.categorie} vertraging={i * 0.08}>
            <Link
              href={`/categorie/${banner.categorie}`}
              className={`group relative grid h-full overflow-hidden rounded-[2rem] ${banner.vlak} sm:grid-cols-[1.1fr_1fr]`}
            >
              <span className="flex flex-col justify-center p-8 sm:p-10">
                <span className="text-salie-700 bovenschrift">{banner.bovenschrift}</span>
                <span className="mt-3 block font-display text-3xl leading-tight font-semibold text-inkt sm:text-4xl">
                  {banner.titel}
                </span>
                <span className="mt-3 block max-w-xs text-sm leading-relaxed text-inkt-zacht">{banner.tekst}</span>
                <span className="mt-7 inline-flex items-center gap-2 text-sm font-medium text-salie-800">
                  Bekijk de collectie
                  <ArrowRight className="size-4 transition-transform duration-300 ease-[var(--ease-uit)] group-hover:translate-x-1" />
                </span>
              </span>

              <span className="relative block min-h-64 sm:min-h-80">
                <Image
                  src={banner.foto}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 45vw, 100vw"
                  style={fotoStijl(banner.foto)}
                  className="object-cover transition-transform duration-[1200ms] ease-[var(--ease-uit)] group-hover:scale-105"
                />
                <Zegel className="absolute top-5 left-5 size-[4.75rem] sm:-left-9">
                  <span>
                    <span className="block text-[0.5625rem] font-semibold tracking-[0.1em] uppercase">vanaf srd</span>
                    <span className="block font-display text-lg font-bold">{banner.vanaf},-</span>
                  </span>
                </Zegel>
              </span>
            </Link>
          </Onthul>
        ))}
      </div>
    </section>
  );
}
