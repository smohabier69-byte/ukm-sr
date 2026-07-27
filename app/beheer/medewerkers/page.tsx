import { Mail, Phone } from "lucide-react";

import { Paneel } from "@/components/beheer/paneel";
import { medewerkers } from "@/data/beheer/medewerkers";
import { formatDatumLang } from "@/lib/format";

export const metadata = { title: "Medewerkers" };

export default function MedewerkersPagina() {
  const actief = medewerkers.filter((m) => m.actief);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Tegel label="Medewerkers" waarde={String(medewerkers.length)} />
        <Tegel label="Actief" waarde={String(actief.length)} />
        <Tegel label="Afdelingen" waarde={String(new Set(medewerkers.map((m) => m.afdeling)).size)} />
      </div>

      <Paneel titel="Team" tekst="Rollen bepalen wat iemand in dit paneel te zien krijgt.">
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {medewerkers.map((medewerker) => (
            <li
              key={medewerker.id}
              className="flex flex-col rounded-2xl border border-border/70 bg-creme/50 p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-salie-200 font-display text-sm font-semibold text-salie-800">
                    {medewerker.naam
                      .split(" ")
                      .map((deel) => deel[0])
                      .slice(0, 2)
                      .join("")}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-display font-semibold">{medewerker.naam}</p>
                    <p className="truncate text-sm text-inkt-zacht">{medewerker.rol}</p>
                  </div>
                </div>

                <span
                  className={
                    medewerker.actief
                      ? "shrink-0 rounded-full bg-[var(--status-goed)]/12 px-2.5 py-1 text-xs font-medium text-[#0a7d0a]"
                      : "shrink-0 rounded-full bg-creme-diep px-2.5 py-1 text-xs font-medium text-inkt-zacht"
                  }
                >
                  {medewerker.actief ? "Actief" : "Uit dienst"}
                </span>
              </div>

              <dl className="mt-5 space-y-2 text-sm">
                <div className="flex items-center gap-2.5 text-inkt-zacht">
                  <Mail className="size-3.5 shrink-0" />
                  <span className="truncate">{medewerker.email}</span>
                </div>
                <div className="flex items-center gap-2.5 text-inkt-zacht">
                  <Phone className="size-3.5 shrink-0" />
                  {medewerker.telefoon}
                </div>
              </dl>

              <div className="mt-5 border-t border-border pt-4">
                <p className="text-xs text-inkt-zacht">
                  {medewerker.afdeling} &middot; sinds {formatDatumLang(medewerker.inDienstSinds)}
                </p>
                <ul className="mt-2.5 flex flex-wrap gap-1.5">
                  {medewerker.rechten.map((recht) => (
                    <li
                      key={recht}
                      className="rounded-full bg-salie-100 px-2.5 py-1 text-[0.6875rem] font-medium text-salie-800"
                    >
                      {recht}
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ul>
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
