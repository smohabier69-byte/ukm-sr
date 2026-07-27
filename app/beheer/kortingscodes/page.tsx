import { Cel, Kop, Paneel, Tabel } from "@/components/beheer/paneel";
import { kortingscodes } from "@/lib/winkel/prijzen";
import { geldigeBestellingen } from "@/data/beheer/bestellingen";
import { formatAantal, formatPrijs } from "@/lib/format";

export const metadata = { title: "Kortingscodes" };

export default function KortingscodesPagina() {
  const gebruik = kortingscodes.map((code) => {
    const gebruikt = geldigeBestellingen.filter((b) => b.kortingscode === code.code);
    return {
      ...code,
      keer: gebruikt.length,
      weggegeven: gebruikt.reduce((som, b) => som + b.korting, 0),
      omzet: gebruikt.reduce((som, b) => som + b.totaal, 0),
    };
  });

  const totaalWeggegeven = gebruik.reduce((som, c) => som + c.weggegeven, 0);
  const totaalOmzet = gebruik.reduce((som, c) => som + c.omzet, 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Tegel label="Actieve codes" waarde={String(kortingscodes.length)} />
        <Tegel label="Korting weggegeven" waarde={formatPrijs(totaalWeggegeven)} />
        <Tegel label="Omzet met korting" waarde={formatPrijs(totaalOmzet)} />
      </div>

      <Paneel titel="Kortingscodes" tekst="Codes die klanten in de winkelwagen kunnen invullen.">
        <Tabel>
          <thead>
            <tr>
              <Kop>Code</Kop>
              <Kop className="hidden md:table-cell">Voorwaarde</Kop>
              <Kop className="text-right">Gebruikt</Kop>
              <Kop className="text-right">Weggegeven</Kop>
              <Kop className="text-right">Omzet</Kop>
            </tr>
          </thead>
          <tbody>
            {gebruik.map((code) => (
              <tr key={code.code} className="transition-colors hover:bg-creme/60">
                <Cel>
                  <p className="font-display font-semibold tracking-wide tabular-nums">{code.code}</p>
                  <p className="text-xs text-inkt-zacht">{code.omschrijving}</p>
                </Cel>
                <Cel className="hidden text-inkt-zacht md:table-cell">
                  {code.vanaf ? `Vanaf ${formatPrijs(code.vanaf)}` : "Geen minimum"}
                </Cel>
                <Cel className="text-right tabular-nums">{formatAantal(code.keer)}x</Cel>
                <Cel className="text-right tabular-nums text-inkt-zacht">
                  {code.soort === "bezorging" ? "Bezorgkosten" : formatPrijs(code.weggegeven)}
                </Cel>
                <Cel className="text-right font-medium tabular-nums">{formatPrijs(code.omzet)}</Cel>
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
