import Image from "next/image";
import Link from "next/link";

import { OnthulGroep, OnthulKind } from "@/components/motion/onthul";
import { Sectiekop } from "@/components/home/sectiekop";
import { categorieen } from "@/data/categorieen";
import { alleProducten } from "@/lib/square/producten";
import { formatPrijs } from "@/lib/format";
import { fotoStijl } from "@/lib/fotofocus";

/** Korte roepnaam onder elke boog; de volledige naam staat op de categoriepagina. */
const roepnamen: Record<string, string> = {
  ptc: "PTC brillen",
  "anti-blauwlicht": "Anti-blauwlicht",
  leesbrillen: "Leesbrillen",
  "heren-unisex": "Heren & unisex",
  "lenzen-zonder-sterkte": "Kleurlenzen",
  "lenzen-met-sterkte": "Lenzen op sterkte",
};

const achtergronden = ["bg-blush-100", "bg-salie-100", "bg-boter-100", "bg-lila-100", "bg-blush-100", "bg-salie-100"];

/**
 * De collecties als rij etalageboogjes. Op mobiel schuift de rij; vanaf
 * desktop staan alle zes naast elkaar.
 */
export async function CategorieenSectie() {
  const producten = await alleProducten();
  const tegels = categorieen
    .map((categorie) => {
      const inCategorie = producten.filter((p) => p.categorie === categorie.slug);
      return {
        categorie,
        aantal: inCategorie.length,
        vanaf: inCategorie.length ? Math.min(...inCategorie.map((p) => p.prijs)) : undefined,
      };
    })
    .filter((tegel) => tegel.aantal > 0);

  if (tegels.length === 0) return null;

  return (
    <section className="container-ukm py-14 lg:py-20">
      <Sectiekop
        bovenschrift="Collecties"
        titel={
          <>
            Loop even <em>binnen</em>
          </>
        }
        tekst="Zes collecties, ingedeeld zoals in de winkel aan de Rembrandtstraat."
        link={{ label: "Alle producten", href: "/producten" }}
      />

      <OnthulGroep className="-mx-5 flex gap-4 px-5 pb-2 schuifrij sm:gap-5 lg:mx-0 lg:grid lg:grid-cols-6 lg:overflow-visible lg:px-0">
        {tegels.map(({ categorie, aantal, vanaf }, i) => (
          <OnthulKind key={categorie.slug} className="w-40 shrink-0 snap-start sm:w-48 lg:w-auto">
            <Link href={`/categorie/${categorie.slug}`} className="group block text-center">
              <span
                className={`relative block aspect-[3/4] overflow-hidden rounded-t-full rounded-b-3xl ${achtergronden[i % achtergronden.length]} p-2 transition-transform duration-500 ease-[var(--ease-uit)] group-hover:-translate-y-1.5`}
              >
                <span className="relative block size-full overflow-hidden rounded-t-full rounded-b-[1.25rem] bg-creme-diep">
                  <Image
                    src={categorie.afbeelding}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 15vw, 12rem"
                    style={fotoStijl(categorie.afbeelding)}
                    className="object-cover transition-transform duration-700 ease-[var(--ease-uit)] group-hover:scale-105"
                  />
                </span>
              </span>
              <span className="mt-4 block font-display text-lg leading-tight font-semibold text-inkt transition-colors group-hover:text-salie-700">
                {roepnamen[categorie.slug] ?? categorie.naam}
              </span>
              <span className="mt-1 block text-xs text-inkt-zacht">
                {aantal} {aantal === 1 ? "model" : "modellen"}
                {vanaf !== undefined ? ` · vanaf ${formatPrijs(vanaf)}` : ""}
              </span>
            </Link>
          </OnthulKind>
        ))}
      </OnthulGroep>
    </section>
  );
}
