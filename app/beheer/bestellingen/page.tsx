import Link from "next/link";

import { Cel, Kop, Paneel, Statuslabel, Tabel } from "@/components/beheer/paneel";
import { bestellingen, geldigeBestellingen } from "@/data/beheer/bestellingen";
import { statusverdeling } from "@/data/beheer/statistieken";
import { formatAantal, formatDatum, formatPrijs } from "@/lib/format";

export const metadata = { title: "Bestellingen" };

export default function BestellingenPagina() {
  const omzet = geldigeBestellingen.reduce((som, b) => som + b.totaal, 0);
  const gemiddelde = geldigeBestellingen.length ? Math.round(omzet / geldigeBestellingen.length) : 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Samenvatting label="Alle bestellingen" waarde={formatAantal(bestellingen.length)} />
        <Samenvatting label="Totale omzet" waarde={formatPrijs(omzet)} />
        <Samenvatting label="Gemiddelde bestelwaarde" waarde={formatPrijs(gemiddelde)} />
        <Samenvatting
          label="Open bestellingen"
          waarde={formatAantal(
            statusverdeling
              .filter((rij) => rij.status !== "afgerond" && rij.status !== "geannuleerd")
              .reduce((som, rij) => som + rij.aantal, 0),
          )}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {statusverdeling.map((rij) => (
          <span
            key={rij.status}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-3.5 py-1.5 text-xs"
          >
            <Statuslabel status={rij.status} />
            <span className="font-medium tabular-nums">{rij.aantal}</span>
          </span>
        ))}
      </div>

      <Paneel titel="Alle bestellingen" tekst={`${bestellingen.length} bestellingen, nieuwste eerst.`}>
        <Tabel>
          <thead>
            <tr>
              <Kop>Nummer</Kop>
              <Kop>Klant</Kop>
              <Kop className="hidden md:table-cell">Datum</Kop>
              <Kop className="hidden lg:table-cell">Artikelen</Kop>
              <Kop className="hidden lg:table-cell">Levering</Kop>
              <Kop>Status</Kop>
              <Kop className="text-right">Totaal</Kop>
            </tr>
          </thead>
          <tbody>
            {bestellingen.map((bestelling) => (
              <tr key={bestelling.nummer} className="transition-colors hover:bg-creme/60">
                <Cel>
                  <Link
                    href={`/beheer/bestellingen/${bestelling.nummer}`}
                    className="font-medium tabular-nums transition-colors hover:text-salie-700"
                  >
                    {bestelling.nummer}
                  </Link>
                </Cel>
                <Cel className="text-inkt-zacht">{bestelling.klantnaam}</Cel>
                <Cel className="hidden text-inkt-zacht tabular-nums md:table-cell">
                  {formatDatum(bestelling.datum)}
                </Cel>
                <Cel className="hidden text-inkt-zacht tabular-nums lg:table-cell">
                  {bestelling.regels.reduce((som, r) => som + r.aantal, 0)}
                </Cel>
                <Cel className="hidden text-inkt-zacht capitalize lg:table-cell">{bestelling.bezorgwijze}</Cel>
                <Cel>
                  <Statuslabel status={bestelling.status} />
                </Cel>
                <Cel className="text-right font-medium tabular-nums">{formatPrijs(bestelling.totaal)}</Cel>
              </tr>
            ))}
          </tbody>
        </Tabel>
      </Paneel>
    </div>
  );
}

function Samenvatting({ label, waarde }: { label: string; waarde: string }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-white p-5">
      <p className="text-sm text-inkt-zacht">{label}</p>
      <p className="mt-2 font-display text-2xl font-bold">{waarde}</p>
    </div>
  );
}
