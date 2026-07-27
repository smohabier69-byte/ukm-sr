import { Info } from "lucide-react";

import { Paneel } from "@/components/beheer/paneel";
import { Input } from "@/components/ui/input";
import { bedrijf } from "@/lib/site";
import { formatPrijs } from "@/lib/format";

export const metadata = { title: "Instellingen" };

export default function InstellingenPagina() {
  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-start gap-3 rounded-2xl border border-goud/30 bg-goud/8 px-5 py-4">
        <Info className="mt-0.5 size-5 shrink-0 text-goud" />
        <p className="text-sm leading-relaxed text-inkt-zacht">
          De velden hieronder tonen de gegevens zoals ze nu in de winkel staan. In deze demonstratie worden
          wijzigingen niet bewaard.
        </p>
      </div>

      <Paneel titel="Bedrijfsgegevens" tekst="Deze gegevens staan in de voettekst, op de contactpagina en in de zoekresultaten.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Veld label="Winkelnaam" waarde={bedrijf.naam} />
          <Veld label="Tagline" waarde={bedrijf.tagline} />
          <Veld label="Adres" waarde={bedrijf.adres.straat} />
          <Veld label="Plaats" waarde={`${bedrijf.adres.stad}, ${bedrijf.adres.land}`} />
          <Veld label="Telefoon" waarde={bedrijf.telefoon} />
          <Veld label="E-mail" waarde={bedrijf.email} />
        </div>
      </Paneel>

      <Paneel titel="Openingstijden">
        <dl className="divide-y divide-border">
          {bedrijf.openingstijden.map((rij) => (
            <div key={rij.dagen} className="flex items-center justify-between py-3 text-sm">
              <dt className="text-inkt-zacht">{rij.dagen}</dt>
              <dd className="font-medium tabular-nums">{rij.tijden}</dd>
            </div>
          ))}
        </dl>
      </Paneel>

      <Paneel titel="Bezorging en BTW" tekst="Deze waarden bepalen de berekening in de winkelwagen.">
        <div className="grid gap-4 sm:grid-cols-3">
          <Veld label="Bezorgkosten" waarde={formatPrijs(bedrijf.bezorgingVanaf)} />
          <Veld label="Gratis bezorging vanaf" waarde={formatPrijs(bedrijf.gratisBezorgingVanaf)} />
          <Veld label="BTW-tarief" waarde={`${Math.round(bedrijf.btwTarief * 100)}%`} />
        </div>
        <p className="mt-5 text-sm leading-relaxed text-inkt-zacht">
          De prijzen in de prijslijst zijn winkelprijzen inclusief BTW. In de winkelwagen wordt het BTW-bedrag
          daarom uit het totaal gelicht en niet erbovenop geteld.
        </p>
      </Paneel>
    </div>
  );
}

function Veld({ label, waarde }: { label: string; waarde: string }) {
  const id = `instelling-${label.toLowerCase().replace(/[^a-z]/g, "-")}`;
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium">
        {label}
      </label>
      <Input id={id} defaultValue={waarde} readOnly className="bg-creme/60" />
    </div>
  );
}
