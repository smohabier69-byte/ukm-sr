import { Check, Minus } from "lucide-react";

import { Cel, Kop, Paneel, Tabel } from "@/components/beheer/paneel";
import { klantoverzicht } from "@/data/beheer/statistieken";
import { formatAantal, formatDatum, formatPrijs } from "@/lib/format";

export const metadata = { title: "Klanten" };

export default function KlantenPagina() {
  const totaalBesteed = klantoverzicht.reduce((som, k) => som + k.besteed, 0);
  const metBestelling = klantoverzicht.filter((k) => k.bestellingen > 0);
  const aangemeld = klantoverzicht.filter((k) => k.nieuwsbrief).length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Tegel label="Klanten" waarde={formatAantal(klantoverzicht.length)} />
        <Tegel label="Met een bestelling" waarde={formatAantal(metBestelling.length)} />
        <Tegel
          label="Gemiddeld besteed"
          waarde={formatPrijs(metBestelling.length ? Math.round(totaalBesteed / metBestelling.length) : 0)}
        />
        <Tegel label="Nieuwsbrief" waarde={`${aangemeld} van ${klantoverzicht.length}`} />
      </div>

      <Paneel titel="Alle klanten" tekst="Gesorteerd op besteed bedrag.">
        <Tabel>
          <thead>
            <tr>
              <Kop>Klant</Kop>
              <Kop className="hidden md:table-cell">Wijk</Kop>
              <Kop className="hidden lg:table-cell">Klant sinds</Kop>
              <Kop className="hidden lg:table-cell">Laatste bestelling</Kop>
              <Kop className="text-center">Nieuwsbrief</Kop>
              <Kop className="text-right">Bestellingen</Kop>
              <Kop className="text-right">Besteed</Kop>
            </tr>
          </thead>
          <tbody>
            {klantoverzicht.map((klant) => (
              <tr key={klant.id} className="transition-colors hover:bg-creme/60">
                <Cel>
                  <p className="font-medium">{klant.naam}</p>
                  <p className="text-xs text-inkt-zacht">{klant.email}</p>
                </Cel>
                <Cel className="hidden text-inkt-zacht md:table-cell">{klant.wijk}</Cel>
                <Cel className="hidden text-inkt-zacht tabular-nums lg:table-cell">
                  {formatDatum(klant.klantSinds)}
                </Cel>
                <Cel className="hidden text-inkt-zacht tabular-nums lg:table-cell">
                  {klant.laatsteBestelling ? formatDatum(klant.laatsteBestelling) : "-"}
                </Cel>
                <Cel className="text-center">
                  {klant.nieuwsbrief ? (
                    <span className="inline-flex items-center gap-1 text-xs text-salie-700">
                      <Check className="size-3.5" />
                      Ja
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-inkt-zacht">
                      <Minus className="size-3.5" />
                      Nee
                    </span>
                  )}
                </Cel>
                <Cel className="text-right tabular-nums">{klant.bestellingen}</Cel>
                <Cel className="text-right font-medium tabular-nums">{formatPrijs(klant.besteed)}</Cel>
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
