import Image from "next/image";
import Link from "next/link";

import { Cel, Kop, Paneel, Tabel } from "@/components/beheer/paneel";
import { categorieen, hoofdcategorieen } from "@/data/categorieen";
import { aantalPerCategorie, producten } from "@/data/producten";
import { omzetPerCategorie } from "@/data/beheer/statistieken";
import { formatAantal, formatPrijs } from "@/lib/format";

export const metadata = { title: "Categorieen" };

export default function CategorieenPagina() {
  const aantallen = aantalPerCategorie();
  const omzetPerLabel = new Map(omzetPerCategorie.map((rij) => [rij.label, rij.waarde]));

  return (
    <div className="space-y-6">
      <Paneel titel="Hoofdingangen" tekst="De twee ingangen in de navigatie van de winkel.">
        <div className="grid gap-4 sm:grid-cols-2">
          {hoofdcategorieen.map((hoofd) => {
            const aantal = producten.filter((p) => p.soort === hoofd.soort).length;
            return (
              <Link
                key={hoofd.slug}
                href={`/categorie/${hoofd.slug}`}
                className="group relative overflow-hidden rounded-2xl bg-creme-diep p-6"
              >
                <Image
                  src={hoofd.afbeelding}
                  alt=""
                  fill
                  sizes="(min-width: 640px) 50vw, 100vw"
                  className="object-cover object-top transition-transform duration-700 ease-[var(--ease-uit)] group-hover:scale-105"
                />
                <div className="absolute inset-0 overlay-onder" />
                <div className="relative pt-16 text-white">
                  <p className="font-display text-lg font-semibold">{hoofd.naam}</p>
                  <p className="mt-1 text-sm text-white/80">{aantal} artikelen</p>
                </div>
              </Link>
            );
          })}
        </div>
      </Paneel>

      <Paneel titel="Collecties" tekst="Elke collectie is een eigen pagina in de winkel.">
        <Tabel>
          <thead>
            <tr>
              <Kop>Collectie</Kop>
              <Kop className="hidden md:table-cell">Soort</Kop>
              <Kop className="text-right">Artikelen</Kop>
              <Kop className="text-right">Omzet</Kop>
              <Kop className="text-right">Pagina</Kop>
            </tr>
          </thead>
          <tbody>
            {categorieen.map((categorie) => (
              <tr key={categorie.slug} className="transition-colors hover:bg-creme/60">
                <Cel>
                  <p className="font-medium">{categorie.naam}</p>
                  <p className="max-w-md truncate text-xs text-inkt-zacht">{categorie.omschrijving}</p>
                </Cel>
                <Cel className="hidden text-inkt-zacht md:table-cell">
                  {categorie.soort === "bril" ? "Brillen" : "Lenzen"}
                </Cel>
                <Cel className="text-right tabular-nums">{formatAantal(aantallen[categorie.slug] ?? 0)}</Cel>
                <Cel className="text-right font-medium tabular-nums">
                  {formatPrijs(omzetPerLabel.get(categorie.naam) ?? 0)}
                </Cel>
                <Cel className="text-right">
                  <Link
                    href={`/categorie/${categorie.slug}`}
                    className="text-sm font-medium text-salie-700 transition-colors hover:text-salie-800"
                  >
                    Bekijken
                  </Link>
                </Cel>
              </tr>
            ))}
          </tbody>
        </Tabel>
      </Paneel>
    </div>
  );
}
