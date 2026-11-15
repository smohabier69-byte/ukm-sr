import Link from "next/link";

import { OnthulGroep, OnthulKind } from "@/components/motion/onthul";
import { Productkaart } from "@/components/product/productkaart";
import { Sectiekop } from "@/components/home/sectiekop";
import { kleurprofielen, type Kleurfamilie } from "@/data/catalogus/gemeenschappelijk";
import { kleurlabels } from "@/lib/catalogus";
import { alleProducten } from "@/lib/square/producten";
import type { Product } from "@/types/product";

/**
 * Kleurlenzen, ingedeeld op kleur in plaats van op sterkte: zo kiest een
 * klant ze ook in de winkel. De kleurstippen linken naar de gefilterde
 * lenzenpagina; de rij eronder toont per kleur de best lopende lens.
 */
export async function Lenskleuren() {
  const lenzen = (await alleProducten()).filter((p) => p.soort === "lens");
  if (lenzen.length === 0) return null;

  const kleuren = (Object.keys(kleurprofielen) as Kleurfamilie[])
    .map((kleur) => ({
      kleur,
      label: kleurlabels[kleur] ?? kleurprofielen[kleur].familie,
      swatch: kleurprofielen[kleur].swatch,
      aantal: lenzen.filter((p) => p.kleurfamilie === kleur).length,
    }))
    .filter((k) => k.aantal > 0);

  // Een lens per kleurfamilie, op voorraad en zo populair mogelijk.
  const uitgelicht: Product[] = [];
  const gesorteerd = [...lenzen].filter((p) => p.voorraad > 0).sort((a, b) => b.populariteit - a.populariteit);
  for (const { kleur } of kleuren) {
    const beste = gesorteerd.find((p) => p.kleurfamilie === kleur && !uitgelicht.some((u) => u.naam === p.naam));
    if (beste) uitgelicht.push(beste);
    if (uitgelicht.length === 4) break;
  }

  return (
    <section className="bg-lila-100/50 py-16 lg:py-24">
      <div className="container-ukm">
        <Sectiekop
          bovenschrift="Soft lenses"
          titel={
            <>
              Vind <em>jouw kleur</em>
            </>
          }
          tekst="Zachte kleurlenzen, zes maanden houdbaar en FDA, GMP, ISO en CE goedgekeurd. Met en zonder sterkte."
          link={{ label: "Alle lenzen", href: "/categorie/lenzen" }}
        />

        <ul className="mb-10 flex flex-wrap gap-2.5">
          {kleuren.map(({ kleur, label, swatch, aantal }) => (
            <li key={kleur}>
              <Link
                href={`/categorie/lenzen?kleur=${kleur}`}
                className="inline-flex items-center gap-2.5 rounded-full bg-white py-2 pr-4 pl-2 text-sm shadow-zacht transition-transform duration-300 ease-[var(--ease-uit)] hover:-translate-y-0.5"
              >
                <span
                  aria-hidden
                  className="size-6 rounded-full ring-2 ring-white"
                  style={{
                    background: `radial-gradient(circle at 50% 50%, #1b1b1b 0 22%, ${swatch} 24% 78%, color-mix(in srgb, ${swatch} 60%, #1b1b1b) 80%)`,
                  }}
                />
                {label}
                <span className="text-xs text-inkt-zacht">{aantal}</span>
              </Link>
            </li>
          ))}
        </ul>

        <OnthulGroep className="grid grid-cols-2 gap-x-5 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
          {uitgelicht.map((product) => (
            <OnthulKind key={product.id}>
              <Productkaart product={product} />
            </OnthulKind>
          ))}
        </OnthulGroep>
      </div>
    </section>
  );
}
