import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, MapPin, Phone } from "lucide-react";

import { Cel, Kop, Paneel, Statuslabel, Tabel } from "@/components/beheer/paneel";
import { bestellingOpNummer, bestellingen, bestellingenVanKlant } from "@/data/beheer/bestellingen";
import { klantOpId } from "@/data/beheer/klanten";
import { producten } from "@/data/producten";
import { bedrijf } from "@/lib/site";
import { formatDatumLang, formatPrijs } from "@/lib/format";

export function generateStaticParams() {
  return bestellingen.map((bestelling) => ({ nummer: bestelling.nummer }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ nummer: string }> }) {
  const { nummer } = await params;
  return { title: `Bestelling ${nummer}` };
}

const afbeeldingPerSlug = new Map(producten.map((p) => [p.slug, p.afbeeldingen[0]]));

export default async function BestellingPagina({ params }: { params: Promise<{ nummer: string }> }) {
  const { nummer } = await params;
  const bestelling = bestellingOpNummer(nummer);
  if (!bestelling) notFound();

  const klant = klantOpId(bestelling.klantId);
  const eerdere = bestellingenVanKlant(bestelling.klantId).filter((b) => b.nummer !== bestelling.nummer);
  const btwAandeel = Math.round((bestelling.totaal * bedrijf.btwTarief) / (1 + bedrijf.btwTarief));

  return (
    <div className="space-y-6">
      <Link
        href="/beheer/bestellingen"
        className="inline-flex items-center gap-1.5 text-sm text-inkt-zacht transition-colors hover:text-inkt"
      >
        <ArrowLeft className="size-4" />
        Terug naar bestellingen
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold tabular-nums">{bestelling.nummer}</h2>
          <p className="mt-1 text-sm text-inkt-zacht">Geplaatst op {formatDatumLang(bestelling.datum)}</p>
        </div>
        <Statuslabel status={bestelling.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <Paneel titel="Artikelen">
            <Tabel>
              <thead>
                <tr>
                  <Kop>Artikel</Kop>
                  <Kop className="text-right">Aantal</Kop>
                  <Kop className="text-right">Stukprijs</Kop>
                  <Kop className="text-right">Totaal</Kop>
                </tr>
              </thead>
              <tbody>
                {bestelling.regels.map((regel) => (
                  <tr key={regel.slug}>
                    <Cel>
                      <div className="flex items-center gap-3">
                        <div className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-creme-diep">
                          <Image
                            src={afbeeldingPerSlug.get(regel.slug) ?? ""}
                            alt=""
                            fill
                            sizes="44px"
                            className="object-cover object-top"
                          />
                        </div>
                        <Link
                          href={`/producten/${regel.slug}`}
                          className="font-medium transition-colors hover:text-salie-700"
                        >
                          {regel.naam}
                        </Link>
                      </div>
                    </Cel>
                    <Cel className="text-right tabular-nums">{regel.aantal}</Cel>
                    <Cel className="text-right tabular-nums text-inkt-zacht">{formatPrijs(regel.stukprijs)}</Cel>
                    <Cel className="text-right font-medium tabular-nums">
                      {formatPrijs(regel.stukprijs * regel.aantal)}
                    </Cel>
                  </tr>
                ))}
              </tbody>
            </Tabel>

            <dl className="mt-6 ml-auto max-w-xs space-y-2.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-inkt-zacht">Subtotaal</dt>
                <dd className="tabular-nums">{formatPrijs(bestelling.subtotaal)}</dd>
              </div>
              {bestelling.korting > 0 ? (
                <div className="flex justify-between text-salie-700">
                  <dt>Korting {bestelling.kortingscode ? `(${bestelling.kortingscode})` : ""}</dt>
                  <dd className="tabular-nums">-{formatPrijs(bestelling.korting)}</dd>
                </div>
              ) : null}
              <div className="flex justify-between">
                <dt className="text-inkt-zacht">Bezorging</dt>
                <dd className="tabular-nums">
                  {bestelling.bezorgkosten === 0 ? "Gratis" : formatPrijs(bestelling.bezorgkosten)}
                </dd>
              </div>
              <div className="flex justify-between border-t border-border pt-2.5 font-display text-base font-bold">
                <dt>Totaal</dt>
                <dd className="tabular-nums">{formatPrijs(bestelling.totaal)}</dd>
              </div>
              <div className="flex justify-between text-xs text-inkt-zacht">
                <dt>Waarvan BTW ({Math.round(bedrijf.btwTarief * 100)}%)</dt>
                <dd className="tabular-nums">{formatPrijs(btwAandeel)}</dd>
              </div>
            </dl>
          </Paneel>

          {eerdere.length > 0 ? (
            <Paneel titel="Eerdere bestellingen van deze klant">
              <ul className="divide-y divide-border/60">
                {eerdere.slice(0, 5).map((eerder) => (
                  <li key={eerder.nummer} className="flex items-center justify-between gap-4 py-3">
                    <Link
                      href={`/beheer/bestellingen/${eerder.nummer}`}
                      className="text-sm font-medium tabular-nums transition-colors hover:text-salie-700"
                    >
                      {eerder.nummer}
                    </Link>
                    <span className="text-sm text-inkt-zacht tabular-nums">
                      {formatDatumLang(eerder.datum)}
                    </span>
                    <span className="text-sm font-medium tabular-nums">{formatPrijs(eerder.totaal)}</span>
                  </li>
                ))}
              </ul>
            </Paneel>
          ) : null}
        </div>

        <div className="space-y-6">
          <Paneel titel="Klant">
            {klant ? (
              <div className="space-y-3 text-sm">
                <Link
                  href={`/beheer/klanten`}
                  className="font-display text-base font-semibold transition-colors hover:text-salie-700"
                >
                  {klant.naam}
                </Link>
                <p className="flex items-center gap-2.5 text-inkt-zacht">
                  <Mail className="size-4 shrink-0" />
                  {klant.email}
                </p>
                <p className="flex items-center gap-2.5 text-inkt-zacht">
                  <Phone className="size-4 shrink-0" />
                  {klant.telefoon}
                </p>
                <p className="flex items-center gap-2.5 text-inkt-zacht">
                  <MapPin className="size-4 shrink-0" />
                  {klant.wijk}, {bedrijf.adres.stad}
                </p>
              </div>
            ) : (
              <p className="text-sm text-inkt-zacht">Klantgegevens niet gevonden.</p>
            )}
          </Paneel>

          <Paneel titel="Levering en betaling">
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-inkt-zacht">Wijze</dt>
                <dd className="mt-0.5 font-medium capitalize">{bestelling.bezorgwijze}</dd>
              </div>
              <div>
                <dt className="text-inkt-zacht">Betaling</dt>
                <dd className="mt-0.5 font-medium capitalize">{bestelling.betaalwijze}</dd>
              </div>
              {bestelling.kortingscode ? (
                <div>
                  <dt className="text-inkt-zacht">Kortingscode</dt>
                  <dd className="mt-0.5 font-medium tabular-nums">{bestelling.kortingscode}</dd>
                </div>
              ) : null}
            </dl>
          </Paneel>
        </div>
      </div>
    </div>
  );
}
