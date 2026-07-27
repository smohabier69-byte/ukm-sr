import Image from "next/image";
import Link from "next/link";

import { Cel, Kop, Paneel, Tabel, Voorraadlabel } from "@/components/beheer/paneel";
import { categorielabels, merklabels } from "@/lib/catalogus";
import { producten } from "@/data/producten";
import { topProducten } from "@/data/beheer/statistieken";
import { formatAantal, formatPrijs } from "@/lib/format";

export const metadata = { title: "Producten" };

const verkochtPerSlug = new Map(topProducten.map((p) => [p.slug, p.aantal]));

export default function ProductenPagina() {
  const gesorteerd = [...producten].sort((a, b) => a.naam.localeCompare(b.naam, "nl"));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Tegel label="Artikelen" waarde={formatAantal(producten.length)} />
        <Tegel label="Brillen" waarde={formatAantal(producten.filter((p) => p.soort === "bril").length)} />
        <Tegel label="Lenzen" waarde={formatAantal(producten.filter((p) => p.soort === "lens").length)} />
        <Tegel
          label="Gemiddelde prijs"
          waarde={formatPrijs(Math.round(producten.reduce((s, p) => s + p.prijs, 0) / producten.length))}
        />
      </div>

      <Paneel
        titel="Alle artikelen"
        tekst="Rechtstreeks uit de prijslijsten van april 2026, op alfabet."
        link={{ label: "Bekijk in de winkel", href: "/producten" }}
      >
        <Tabel>
          <thead>
            <tr>
              <Kop>Artikel</Kop>
              <Kop className="hidden md:table-cell">Categorie</Kop>
              <Kop className="hidden lg:table-cell">Huislijn</Kop>
              <Kop className="text-right">Prijs</Kop>
              <Kop className="hidden text-right sm:table-cell">Verkocht</Kop>
              <Kop className="text-right">Voorraad</Kop>
            </tr>
          </thead>
          <tbody>
            {gesorteerd.map((product) => (
              <tr key={product.slug} className="transition-colors hover:bg-creme/60">
                <Cel>
                  <div className="flex items-center gap-3">
                    <div className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-creme-diep">
                      <Image
                        src={product.afbeeldingen[0]}
                        alt=""
                        fill
                        sizes="40px"
                        className="object-cover object-top"
                      />
                    </div>
                    <div className="min-w-0">
                      <Link
                        href={`/producten/${product.slug}`}
                        className="block truncate font-medium transition-colors hover:text-salie-700"
                      >
                        {product.naam}
                      </Link>
                      <p className="truncate text-xs text-inkt-zacht">{product.catalogusnaam}</p>
                    </div>
                  </div>
                </Cel>
                <Cel className="hidden text-inkt-zacht md:table-cell">
                  {categorielabels[product.categorie] ?? product.categorie}
                </Cel>
                <Cel className="hidden text-inkt-zacht lg:table-cell">
                  {merklabels[product.merk] ?? product.merk}
                </Cel>
                <Cel className="text-right font-medium tabular-nums">{formatPrijs(product.prijs)}</Cel>
                <Cel className="hidden text-right tabular-nums text-inkt-zacht sm:table-cell">
                  {verkochtPerSlug.get(product.slug) ?? 0}
                </Cel>
                <Cel className="text-right">
                  <Voorraadlabel voorraad={product.voorraad} />
                </Cel>
              </tr>
            ))}
          </tbody>
        </Tabel>
      </Paneel>
    </div>
  );
}

function Tegel({ label, waarde }: { label: string; waarde: string }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-white p-5">
      <p className="text-sm text-inkt-zacht">{label}</p>
      <p className="mt-2 font-display text-2xl font-bold">{waarde}</p>
    </div>
  );
}
