import Image from "next/image";
import Link from "next/link";

import { Cel, Kop, Paneel, Tabel } from "@/components/beheer/paneel";
import { Lijngrafiek } from "@/components/beheer/grafiek/lijngrafiek";
import { Staafgrafiek } from "@/components/beheer/grafiek/staafgrafiek";
import { geldigeBestellingen } from "@/data/beheer/bestellingen";
import { maandreeks, omzetPerCategorie, topProducten } from "@/data/beheer/statistieken";
import { formatAantal, formatPrijs } from "@/lib/format";

export const metadata = { title: "Rapporten" };

export default function RapportenPagina() {
  const bezorgd = geldigeBestellingen.filter((b) => b.bezorgwijze === "bezorgen").length;
  const afgehaald = geldigeBestellingen.length - bezorgd;

  const betaalwijzen = ["contant", "overschrijving", "pin"].map((wijze) => ({
    label: wijze.charAt(0).toUpperCase() + wijze.slice(1),
    waarde: geldigeBestellingen.filter((b) => b.betaalwijze === wijze).length,
  }));

  const jaaromzet = maandreeks.reduce((som, m) => som + m.omzet, 0);
  const besteMaand = [...maandreeks].sort((a, b) => b.omzet - a.omzet)[0];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Tegel label="Omzet twaalf maanden" waarde={formatPrijs(jaaromzet)} />
        <Tegel label="Beste maand" waarde={`${besteMaand.label} - ${formatPrijs(besteMaand.omzet)}`} />
        <Tegel label="Bezorgd" waarde={`${bezorgd} van ${geldigeBestellingen.length}`} />
        <Tegel label="Zelf afgehaald" waarde={`${afgehaald} van ${geldigeBestellingen.length}`} />
      </div>

      <Paneel titel="Omzet en bestellingen naast elkaar" tekst="Twee maten, twee grafieken - nooit twee assen in een.">
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <p className="mb-3 text-sm font-medium">Omzet per maand</p>
            <Lijngrafiek
              labels={maandreeks.map((m) => m.label)}
              reeksen={[{ naam: "Omzet", kleur: "var(--viz-serie-1)", waarden: maandreeks.map((m) => m.omzet) }]}
              eenheid="srd"
              hoogte={220}
            />
          </div>
          <div>
            <p className="mb-3 text-sm font-medium">Bestellingen per maand</p>
            <Lijngrafiek
              labels={maandreeks.map((m) => m.label)}
              reeksen={[
                {
                  naam: "Bestellingen",
                  kleur: "var(--viz-serie-2)",
                  waarden: maandreeks.map((m) => m.bestellingen),
                },
              ]}
              eenheid="aantal"
              hoogte={220}
            />
          </div>
        </div>
      </Paneel>

      <div className="grid gap-6 lg:grid-cols-2">
        <Paneel titel="Omzet per categorie">
          <Staafgrafiek staven={omzetPerCategorie} eenheid="srd" />
        </Paneel>

        <Paneel titel="Betaalwijzen" tekst="Aantal bestellingen per betaalmethode.">
          <Staafgrafiek
            staven={betaalwijzen}
            eenheid="bestellingen"
          />
        </Paneel>
      </div>

      <Paneel titel="Alle artikelen op omzet" tekst="Volledige ranglijst, hoogste omzet eerst.">
        <Tabel>
          <thead>
            <tr>
              <Kop className="w-10">#</Kop>
              <Kop>Artikel</Kop>
              <Kop className="text-right">Verkocht</Kop>
              <Kop className="text-right">Omzet</Kop>
            </tr>
          </thead>
          <tbody>
            {topProducten.map((product, i) => (
              <tr key={product.slug} className="transition-colors hover:bg-creme/60">
                <Cel className="text-inkt-zacht tabular-nums">{i + 1}</Cel>
                <Cel>
                  <div className="flex items-center gap-3">
                    <div className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-creme-diep">
                      <Image
                        src={product.afbeelding}
                        alt=""
                        fill
                        sizes="40px"
                        className="object-cover object-top"
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
                <Cel className="text-right tabular-nums">{formatAantal(product.aantal)}</Cel>
                <Cel className="text-right font-medium tabular-nums">{formatPrijs(product.omzet)}</Cel>
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
      <p className="mt-2 font-display text-xl font-bold">{waarde}</p>
    </div>
  );
}
