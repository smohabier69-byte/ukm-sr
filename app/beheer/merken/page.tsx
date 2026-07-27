import Link from "next/link";

import { Cel, Kop, Paneel, Tabel } from "@/components/beheer/paneel";
import { Staafgrafiek } from "@/components/beheer/grafiek/staafgrafiek";
import { merken } from "@/data/merken";
import { aantalPerMerk, productenVanMerk } from "@/data/producten";
import { omzetPerMerk } from "@/data/beheer/statistieken";
import { formatAantal, formatPrijs } from "@/lib/format";

export const metadata = { title: "Merken" };

export default function MerkenBeheerPagina() {
  const aantallen = aantalPerMerk();
  const omzetPerLabel = new Map(omzetPerMerk.map((rij) => [rij.label, rij.waarde]));

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Paneel titel="Huislijnen" tekst="UKM voert geen externe merken; het assortiment is verdeeld over zes eigen lijnen.">
          <Tabel>
            <thead>
              <tr>
                <Kop>Huislijn</Kop>
                <Kop className="hidden md:table-cell">Positionering</Kop>
                <Kop className="text-right">Artikelen</Kop>
                <Kop className="text-right">Vanaf</Kop>
                <Kop className="text-right">Omzet</Kop>
              </tr>
            </thead>
            <tbody>
              {merken.map((merk) => {
                const lijst = productenVanMerk(merk.slug);
                const vanaf = lijst.length ? Math.min(...lijst.map((p) => p.prijs)) : 0;
                return (
                  <tr key={merk.slug} className="transition-colors hover:bg-creme/60">
                    <Cel>
                      <Link
                        href={`/merken/${merk.slug}`}
                        className="font-medium transition-colors hover:text-salie-700"
                      >
                        {merk.naam}
                      </Link>
                    </Cel>
                    <Cel className="hidden text-inkt-zacht md:table-cell">{merk.positionering}</Cel>
                    <Cel className="text-right tabular-nums">{formatAantal(aantallen[merk.slug] ?? 0)}</Cel>
                    <Cel className="text-right tabular-nums text-inkt-zacht">{formatPrijs(vanaf)}</Cel>
                    <Cel className="text-right font-medium tabular-nums">
                      {formatPrijs(omzetPerLabel.get(merk.naam) ?? 0)}
                    </Cel>
                  </tr>
                );
              })}
            </tbody>
          </Tabel>
        </Paneel>

        <Paneel titel="Omzet per huislijn">
          <Staafgrafiek staven={omzetPerMerk} eenheid="srd" />
        </Paneel>
      </div>
    </div>
  );
}
