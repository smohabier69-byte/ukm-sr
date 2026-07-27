import { Kerntegel } from "@/components/beheer/kerntegel";
import { Paneel } from "@/components/beheer/paneel";
import { Lijngrafiek } from "@/components/beheer/grafiek/lijngrafiek";
import { Kolomgrafiek, Staafgrafiek } from "@/components/beheer/grafiek/staafgrafiek";
import { statuslabels } from "@/data/beheer/bestellingen";
import {
  kerncijfers,
  maandreeks,
  omzetPerCategorie,
  omzetPerMerk,
  statusverdeling,
} from "@/data/beheer/statistieken";

export const metadata = { title: "Statistieken" };

export default function StatistiekenPagina() {
  const dagcijfer = kerncijfers.find((c) => c.sleutel === "bestellingen");

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kerncijfers.map((cijfer) => (
          <Kerntegel key={cijfer.sleutel} cijfer={cijfer} />
        ))}
      </div>

      <Paneel titel="Omzet over twaalf maanden" tekst="Totale omzet per maand, geannuleerde bestellingen niet meegerekend.">
        <Lijngrafiek
          labels={maandreeks.map((m) => m.label)}
          reeksen={[{ naam: "Omzet", kleur: "var(--viz-serie-1)", waarden: maandreeks.map((m) => m.omzet) }]}
          eenheid="srd"
          hoogte={300}
        />
      </Paneel>

      <div className="grid gap-6 lg:grid-cols-2">
        <Paneel titel="Brillen tegenover lenzen" tekst="Omzet per productsoort, per maand.">
          <Lijngrafiek
            labels={maandreeks.map((m) => m.label)}
            reeksen={[
              { naam: "Brillen", kleur: "var(--viz-serie-1)", waarden: maandreeks.map((m) => m.brillen) },
              { naam: "Lenzen", kleur: "var(--viz-serie-2)", waarden: maandreeks.map((m) => m.lenzen) },
            ]}
            eenheid="srd"
          />
        </Paneel>

        <Paneel titel="Aantal bestellingen per maand">
          <Lijngrafiek
            labels={maandreeks.map((m) => m.label)}
            reeksen={[
              { naam: "Bestellingen", kleur: "var(--viz-serie-1)", waarden: maandreeks.map((m) => m.bestellingen) },
            ]}
            eenheid="aantal"
            metVlak={false}
          />
        </Paneel>
      </div>

      {dagcijfer ? (
        <Paneel titel="Bestellingen per dag" tekst="De laatste dertig dagen.">
          <Kolomgrafiek
            punten={dagcijfer.reeks.map((waarde, i) => ({
              label: `${30 - i} dagen geleden`,
              waarde,
            }))}
            eenheid="bestellingen"
          />
        </Paneel>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <Paneel titel="Omzet per categorie">
          <Staafgrafiek staven={omzetPerCategorie} eenheid="srd" />
        </Paneel>

        <Paneel titel="Omzet per huislijn">
          <Staafgrafiek staven={omzetPerMerk} eenheid="srd" />
        </Paneel>

        <Paneel titel="Bestellingen per status">
          <Staafgrafiek
            staven={statusverdeling.map((rij) => ({
              label: statuslabels[rij.status],
              waarde: rij.aantal,
            }))}
            eenheid="aantal"
          />
        </Paneel>
      </div>
    </div>
  );
}
