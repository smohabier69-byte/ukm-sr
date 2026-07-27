import Image from "next/image";
import Link from "next/link";
import { AlertTriangle, PackageX } from "lucide-react";

import { Cel, Kop, Paneel, Tabel, Voorraadlabel } from "@/components/beheer/paneel";
import { Staafgrafiek } from "@/components/beheer/grafiek/staafgrafiek";
import { categorielabels } from "@/lib/catalogus";
import { producten } from "@/data/producten";
import { DREMPEL_LAGE_VOORRAAD, voorraadsamenvatting } from "@/data/beheer/statistieken";
import { formatAantal, formatPrijs } from "@/lib/format";

export const metadata = { title: "Voorraad" };

export default function VoorraadPagina() {
  const uitverkocht = producten.filter((p) => p.voorraad === 0);
  const bijnaOp = producten
    .filter((p) => p.voorraad > 0 && p.voorraad <= DREMPEL_LAGE_VOORRAAD)
    .sort((a, b) => a.voorraad - b.voorraad);

  const perCategorie = Object.entries(
    producten.reduce<Record<string, number>>((acc, p) => {
      acc[p.categorie] = (acc[p.categorie] ?? 0) + p.voorraad;
      return acc;
    }, {}),
  )
    .map(([slug, waarde]) => ({ label: categorielabels[slug] ?? slug, waarde }))
    .sort((a, b) => b.waarde - a.waarde);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Tegel label="Artikelen op voorraad" waarde={formatAantal(voorraadsamenvatting.opVoorraad)} />
        <Tegel label="Bijna op" waarde={formatAantal(voorraadsamenvatting.bijnaOp)} nadruk="waarschuwing" />
        <Tegel label="Uitverkocht" waarde={formatAantal(voorraadsamenvatting.uitverkocht)} nadruk="kritiek" />
        <Tegel label="Voorraadwaarde" waarde={formatPrijs(voorraadsamenvatting.waarde)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <Paneel titel="Stuks per categorie" tekst={`${formatAantal(voorraadsamenvatting.stuks)} stuks in totaal.`}>
          <Staafgrafiek staven={perCategorie} eenheid="stuks" />
        </Paneel>

        <Paneel
          titel="Bijstellen nodig"
          tekst={`Artikelen met ${DREMPEL_LAGE_VOORRAAD} stuks of minder.`}
        >
          {bijnaOp.length === 0 ? (
            <p className="text-sm text-inkt-zacht">Geen artikelen onder de drempel.</p>
          ) : (
            <ul className="space-y-3">
              {bijnaOp.map((product) => (
                <li key={product.slug} className="flex items-center gap-3">
                  <div className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-creme-diep">
                    <Image src={product.afbeeldingen[0]} alt="" fill sizes="44px" className="object-cover object-top" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/producten/${product.slug}`}
                      className="block truncate text-sm font-medium transition-colors hover:text-salie-700"
                    >
                      {product.naam}
                    </Link>
                    <p className="text-xs text-inkt-zacht">
                      {categorielabels[product.categorie] ?? product.categorie}
                    </p>
                  </div>
                  <Voorraadlabel voorraad={product.voorraad} />
                </li>
              ))}
            </ul>
          )}
        </Paneel>
      </div>

      {uitverkocht.length > 0 ? (
        <Paneel
          titel="Uitverkocht"
          tekst="Deze artikelen staan in de winkel als tijdelijk uitverkocht."
        >
          <Tabel>
            <thead>
              <tr>
                <Kop>Artikel</Kop>
                <Kop className="hidden sm:table-cell">Categorie</Kop>
                <Kop className="text-right">Prijs</Kop>
                <Kop className="text-right">Status</Kop>
              </tr>
            </thead>
            <tbody>
              {uitverkocht.map((product) => (
                <tr key={product.slug}>
                  <Cel>
                    <div className="flex items-center gap-3">
                      <div className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-creme-diep">
                        <Image
                          src={product.afbeeldingen[0]}
                          alt=""
                          fill
                          sizes="40px"
                          className="object-cover object-top opacity-70"
                        />
                      </div>
                      <Link
                        href={`/producten/${product.slug}`}
                        className="font-medium transition-colors hover:text-salie-700"
                      >
                        {product.naam}
                      </Link>
                    </div>
                  </Cel>
                  <Cel className="hidden text-inkt-zacht sm:table-cell">
                    {categorielabels[product.categorie] ?? product.categorie}
                  </Cel>
                  <Cel className="text-right tabular-nums">{formatPrijs(product.prijs)}</Cel>
                  <Cel className="text-right">
                    <Voorraadlabel voorraad={0} />
                  </Cel>
                </tr>
              ))}
            </tbody>
          </Tabel>
        </Paneel>
      ) : null}
    </div>
  );
}

function Tegel({
  label,
  waarde,
  nadruk,
}: {
  label: string;
  waarde: string;
  nadruk?: "waarschuwing" | "kritiek";
}) {
  const Icoon = nadruk === "kritiek" ? PackageX : AlertTriangle;

  return (
    <div className="rounded-2xl border border-border/70 bg-white p-5">
      <p className="flex items-center gap-1.5 text-sm text-inkt-zacht">
        {nadruk ? (
          <Icoon
            className="size-3.5"
            style={{ color: nadruk === "kritiek" ? "var(--status-kritiek)" : "var(--status-waarschuwing)" }}
          />
        ) : null}
        {label}
      </p>
      <p className="mt-2 font-display text-2xl font-bold">{waarde}</p>
    </div>
  );
}
