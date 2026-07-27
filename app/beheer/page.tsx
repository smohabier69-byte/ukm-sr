import Image from "next/image";
import Link from "next/link";
import { AlertTriangle, Info } from "lucide-react";

import { Kerntegel } from "@/components/beheer/kerntegel";
import { Cel, Kop, Paneel, Statuslabel, Tabel, Voorraadlabel } from "@/components/beheer/paneel";
import { Lijngrafiek } from "@/components/beheer/grafiek/lijngrafiek";
import { Staafgrafiek } from "@/components/beheer/grafiek/staafgrafiek";
import { bestellingen } from "@/data/beheer/bestellingen";
import { producten } from "@/data/producten";
import {
  kerncijfers,
  maandreeks,
  omzetPerCategorie,
  topProducten,
  voorraadsamenvatting,
  voorraadwaarschuwingen,
} from "@/data/beheer/statistieken";
import { formatAantal, formatDatum, formatPrijs } from "@/lib/format";

export const metadata = { title: "Dashboard" };

const voorraadPerSlug = new Map(producten.map((p) => [p.slug, p.voorraad]));

export default function BeheerDashboard() {
  const recente = bestellingen.slice(0, 6);

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 rounded-2xl border border-goud/30 bg-goud/8 px-5 py-4">
        <Info className="mt-0.5 size-5 shrink-0 text-goud" />
        <p className="text-sm leading-relaxed text-inkt-zacht">
          <span className="font-medium text-inkt">Demonstratie met voorbeeldgegevens.</span> Producten, prijzen en
          voorraad komen uit de prijslijsten van april 2026; bestellingen, klanten en omzet zijn gegenereerd om te
          laten zien hoe het paneel werkt.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kerncijfers.map((cijfer) => (
          <Kerntegel key={cijfer.sleutel} cijfer={cijfer} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Paneel
          titel="Omzet per maand"
          tekst="Verdeeld over brillen en lenzen, laatste twaalf maanden."
          link={{ label: "Statistieken", href: "/beheer/statistieken" }}
        >
          <Lijngrafiek
            labels={maandreeks.map((m) => m.label)}
            reeksen={[
              { naam: "Brillen", kleur: "var(--viz-serie-1)", waarden: maandreeks.map((m) => m.brillen) },
              { naam: "Lenzen", kleur: "var(--viz-serie-2)", waarden: maandreeks.map((m) => m.lenzen) },
            ]}
            eenheid="srd"
          />
        </Paneel>

        <Paneel titel="Omzet per categorie" tekst="Sinds de start van de meting.">
          <Staafgrafiek
            staven={omzetPerCategorie.map((punt) => ({ label: punt.label, waarde: punt.waarde }))}
            eenheid="srd"
          />
        </Paneel>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Paneel
          titel="Recente bestellingen"
          link={{ label: "Alle bestellingen", href: "/beheer/bestellingen" }}
        >
          <Tabel>
            <thead>
              <tr>
                <Kop>Bestelling</Kop>
                <Kop>Klant</Kop>
                <Kop className="hidden sm:table-cell">Datum</Kop>
                <Kop>Status</Kop>
                <Kop className="text-right">Totaal</Kop>
              </tr>
            </thead>
            <tbody>
              {recente.map((bestelling) => (
                <tr key={bestelling.nummer}>
                  <Cel>
                    <Link
                      href={`/beheer/bestellingen/${bestelling.nummer}`}
                      className="font-medium tabular-nums transition-colors hover:text-salie-700"
                    >
                      {bestelling.nummer}
                    </Link>
                  </Cel>
                  <Cel className="text-inkt-zacht">{bestelling.klantnaam}</Cel>
                  <Cel className="hidden text-inkt-zacht tabular-nums sm:table-cell">
                    {formatDatum(bestelling.datum)}
                  </Cel>
                  <Cel>
                    <Statuslabel status={bestelling.status} />
                  </Cel>
                  <Cel className="text-right font-medium tabular-nums">{formatPrijs(bestelling.totaal)}</Cel>
                </tr>
              ))}
            </tbody>
          </Tabel>
        </Paneel>

        <Paneel
          titel="Voorraadwaarschuwingen"
          tekst={`${voorraadsamenvatting.bijnaOp} bijna op, ${voorraadsamenvatting.uitverkocht} uitverkocht.`}
          link={{ label: "Voorraad", href: "/beheer/voorraad" }}
        >
          {voorraadwaarschuwingen.length === 0 ? (
            <p className="text-sm text-inkt-zacht">Alle artikelen zijn ruim op voorraad.</p>
          ) : (
            <ul className="space-y-3">
              {voorraadwaarschuwingen.slice(0, 6).map((product) => (
                <li key={product.slug} className="flex items-center gap-3">
                  <div className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-creme-diep">
                    <Image
                      src={product.afbeeldingen[0]}
                      alt=""
                      fill
                      sizes="44px"
                      className="object-cover object-top"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{product.naam}</p>
                    <p className="text-xs text-inkt-zacht">{formatPrijs(product.prijs)}</p>
                  </div>
                  <Voorraadlabel voorraad={product.voorraad} />
                </li>
              ))}
            </ul>
          )}

          {voorraadwaarschuwingen.length > 6 ? (
            <p className="mt-4 flex items-center gap-1.5 text-xs text-inkt-zacht">
              <AlertTriangle className="size-3.5 text-[var(--status-waarschuwing)]" />
              Nog {voorraadwaarschuwingen.length - 6} artikelen vragen aandacht.
            </p>
          ) : null}
        </Paneel>
      </div>

      <Paneel titel="Best verkochte artikelen" link={{ label: "Rapporten", href: "/beheer/rapporten" }}>
        <Tabel>
          <thead>
            <tr>
              <Kop>Artikel</Kop>
              <Kop className="text-right">Verkocht</Kop>
              <Kop className="text-right">Omzet</Kop>
              <Kop className="hidden text-right sm:table-cell">Voorraad</Kop>
            </tr>
          </thead>
          <tbody>
            {topProducten.slice(0, 8).map((product) => (
              <tr key={product.slug}>
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
                <Cel className="hidden text-right tabular-nums text-inkt-zacht sm:table-cell">
                  {voorraadPerSlug.get(product.slug) ?? 0} stuks
                </Cel>
              </tr>
            ))}
          </tbody>
        </Tabel>
      </Paneel>
    </div>
  );
}
