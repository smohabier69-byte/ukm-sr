"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, Banknote, Building2, CreditCard, Landmark, MapPin, ShoppingBag, Truck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Kostenregels } from "@/components/winkel/kostenoverzicht";
import { useWinkelHydratie, useWinkelwagen } from "@/lib/winkel/stores";
import { useProductenCache } from "@/lib/winkel/catalogus-cache";
import { berekenKosten, bouwPosten } from "@/lib/winkel/prijzen";
import { formatPrijs } from "@/lib/format";
import { bedrijf } from "@/lib/site";
import { cn } from "@/lib/utils";

type Bezorgwijze = "bezorgen" | "afhalen";
type Betaalwijze = "contant" | "overschrijving" | "pin" | "online";

const betaalwijzen: { id: Betaalwijze; label: string; tekst: string; icoon: typeof Banknote }[] = [
  { id: "online", label: "Online betalen", tekst: "Betaalkaart via een beveiligde Square-pagina", icoon: Landmark },
  { id: "contant", label: "Contant", tekst: "Betaal bij ontvangst of in de winkel", icoon: Banknote },
  { id: "overschrijving", label: "Bankoverschrijving", tekst: "Je ontvangt de gegevens per bericht", icoon: Building2 },
  { id: "pin", label: "Pinnen", tekst: "Met de mobiele pinautomaat of in de winkel", icoon: CreditCard },
];

/** Sleutel waaronder de laatste bestelling tijdelijk staat, voor de terugkeer vanaf Square Checkout. */
const LAATSTE_BESTELLING_KEY = "ukm-laatste-bestelling";

export function AfrekenenInhoud() {
  const router = useRouter();
  const gehydrateerd = useWinkelHydratie();
  const { producten, gereed: catalogusGereed } = useProductenCache();
  const regels = useWinkelwagen((staat) => staat.regels);
  const kortingscode = useWinkelwagen((staat) => staat.kortingscode);
  const leegmaken = useWinkelwagen((staat) => staat.leegmaken);

  const [bezorgwijze, setBezorgwijze] = React.useState<Bezorgwijze>("bezorgen");
  const [betaalwijze, setBetaalwijze] = React.useState<Betaalwijze>("online");
  const [bezigMet, setBezigMet] = React.useState(false);
  const [fout, setFout] = React.useState<string | null>(null);

  const posten = React.useMemo(() => bouwPosten(regels, producten), [regels, producten]);
  const kosten = React.useMemo(
    () => berekenKosten(posten, bezorgwijze === "afhalen" ? "GRATISBEZORGING" : kortingscode),
    [posten, kortingscode, bezorgwijze],
  );

  if (!gehydrateerd || !catalogusGereed) {
    return (
      <div className="grid gap-10 lg:grid-cols-[1fr_22rem]" aria-busy>
        <Skeleton className="h-[32rem] rounded-3xl" />
        <Skeleton className="h-80 rounded-3xl" />
      </div>
    );
  }

  if (posten.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-3xl border border-dashed border-border bg-white/60 px-6 py-24 text-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-salie-100 text-salie-700">
          <ShoppingBag className="size-7" />
        </span>
        <h2 className="mt-7 font-display text-2xl font-semibold">Er is nog niets om af te rekenen</h2>
        <p className="mt-3 max-w-sm leading-relaxed text-inkt-zacht">
          Voeg eerst een artikel toe aan je winkelwagen.
        </p>
        <Button asChild size="lg" className="mt-8">
          <Link href="/producten">Naar het assortiment</Link>
        </Button>
      </div>
    );
  }

  const versturen = async (formulier: React.FormEvent<HTMLFormElement>) => {
    formulier.preventDefault();
    setFout(null);
    setBezigMet(true);

    const data = new FormData(formulier.currentTarget);
    const contact = {
      voornaam: String(data.get("voornaam") ?? ""),
      achternaam: String(data.get("achternaam") ?? ""),
      telefoon: String(data.get("telefoon") ?? ""),
      email: String(data.get("email") ?? ""),
    };
    const adres =
      bezorgwijze === "bezorgen"
        ? {
            straat: String(data.get("adres") ?? ""),
            wijk: String(data.get("wijk") ?? "") || undefined,
            plaats: String(data.get("plaats") ?? ""),
            opmerking: String(data.get("opmerking") ?? "") || undefined,
          }
        : undefined;

    try {
      const res = await fetch("/api/afrekenen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          regels: posten.map((post) => ({ slug: post.regel.slug, variantId: post.regel.variantId, aantal: post.regel.aantal })),
          contact,
          bezorgwijze,
          adres,
          betaalwijze,
          kortingscode: bezorgwijze === "afhalen" ? null : kortingscode,
        }),
      });

      const resultaat = await res.json();
      if (!res.ok) {
        setFout(resultaat.fout ?? "De bestelling kon niet worden geplaatst.");
        setBezigMet(false);
        return;
      }

      if (resultaat.checkoutUrl) {
        sessionStorage.setItem(LAATSTE_BESTELLING_KEY, resultaat.orderId);
        window.location.href = resultaat.checkoutUrl;
        return;
      }

      leegmaken();
      router.push(`/afrekenen/bevestiging?orderId=${resultaat.orderId}`);
    } catch {
      setFout("De bestelling kon niet worden geplaatst. Controleer je internetverbinding en probeer het opnieuw.");
      setBezigMet(false);
    }
  };

  return (
    <form onSubmit={versturen} className="grid gap-10 lg:grid-cols-[1fr_22rem] lg:gap-14">
      <div className="space-y-10">
        <fieldset>
          <legend className="font-display text-lg font-semibold">Contactgegevens</legend>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Veld id="voornaam" label="Voornaam" autoComplete="given-name" />
            <Veld id="achternaam" label="Achternaam" autoComplete="family-name" />
            <Veld id="telefoon" label="Telefoonnummer" type="tel" autoComplete="tel" placeholder="8xx-xxxx" />
            <Veld id="email" label="E-mailadres" type="email" autoComplete="email" />
          </div>
        </fieldset>

        <fieldset>
          <legend className="font-display text-lg font-semibold">Bezorgen of afhalen</legend>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Keuzekaart
              naam="bezorgwijze"
              waarde="bezorgen"
              gekozen={bezorgwijze === "bezorgen"}
              bijKeuze={() => setBezorgwijze("bezorgen")}
              icoon={Truck}
              titel="Laten bezorgen"
              tekst={`In ${bedrijf.adres.stad}, gratis vanaf ${formatPrijs(bedrijf.gratisBezorgingVanaf)}`}
            />
            <Keuzekaart
              naam="bezorgwijze"
              waarde="afhalen"
              gekozen={bezorgwijze === "afhalen"}
              bijKeuze={() => setBezorgwijze("afhalen")}
              icoon={MapPin}
              titel="Zelf afhalen"
              tekst={`${bedrijf.adres.straat}, geen kosten`}
            />
          </div>

          {bezorgwijze === "bezorgen" ? (
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Veld id="adres" label="Straat en huisnummer" autoComplete="street-address" className="sm:col-span-2" />
              <Veld id="wijk" label="Wijk of buurt" optioneel />
              <Veld id="plaats" label="Plaats" defaultValue={bedrijf.adres.stad} autoComplete="address-level2" />
              <Veld
                id="opmerking"
                label="Opmerking voor de bezorger"
                optioneel
                className="sm:col-span-2"
                placeholder="Bijvoorbeeld: bellen bij aankomst"
              />
            </div>
          ) : (
            <p className="mt-5 flex items-start gap-2.5 rounded-2xl bg-salie-50 p-4 text-sm text-inkt-zacht">
              <MapPin className="mt-0.5 size-4 shrink-0 text-salie-700" />
              Haal je bestelling op aan de {bedrijf.adres.straat}.{" "}
              {bedrijf.openingstijden.map((rij) => `${rij.dagen}: ${rij.tijden}`).join(". ")}.
            </p>
          )}
        </fieldset>

        <fieldset>
          <legend className="font-display text-lg font-semibold">Betaalwijze</legend>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {betaalwijzen.map((wijze) => (
              <Keuzekaart
                key={wijze.id}
                naam="betaalwijze"
                waarde={wijze.id}
                gekozen={betaalwijze === wijze.id}
                bijKeuze={() => setBetaalwijze(wijze.id)}
                icoon={wijze.icoon}
                titel={wijze.label}
                tekst={wijze.tekst}
              />
            ))}
          </div>
        </fieldset>
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-3xl border border-border/70 bg-white p-6 sm:p-7">
          <h2 className="font-display text-lg font-semibold">Je bestelling</h2>

          <ul className="mt-5 space-y-4">
            {posten.map((post) => (
              <li key={`${post.regel.slug}-${post.regel.variantId ?? ""}`} className="flex gap-3">
                <div className="relative aspect-square size-14 shrink-0 overflow-hidden rounded-lg bg-creme-diep">
                  <Image
                    src={post.product.afbeeldingen[0]}
                    alt=""
                    fill
                    sizes="56px"
                    className="object-cover object-top"
                  />
                  <span className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-inkt text-[0.625rem] font-medium text-creme">
                    {post.regel.aantal}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{post.product.naam}</p>
                  {post.variant ? <p className="text-xs text-inkt-zacht">{post.variant.naam}</p> : null}
                </div>
                <p className="shrink-0 text-sm font-medium">{formatPrijs(post.totaal)}</p>
              </li>
            ))}
          </ul>

          <div className="mt-6 border-t border-border pt-6">
            <Kostenregels kosten={kosten} />
          </div>

          {fout ? (
            <p className="mt-5 flex items-start gap-2 rounded-xl bg-koraal/10 p-3 text-sm text-koraal">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              {fout}
            </p>
          ) : null}

          <Button type="submit" size="lg" className="mt-7 w-full" disabled={bezigMet}>
            {bezigMet ? "Bezig..." : betaalwijze === "online" ? "Doorgaan naar betalen" : "Bestelling plaatsen"}
          </Button>

          <p className="mt-4 text-center text-xs text-inkt-zacht">
            Betalen met contant, bankoverschrijving, pin of online via een beveiligde Square-pagina.
          </p>
        </div>
      </aside>
    </form>
  );
}

function Veld({
  id,
  label,
  optioneel = false,
  className,
  ...props
}: React.ComponentProps<typeof Input> & { id: string; label: string; optioneel?: boolean }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-2 block text-sm font-medium">
        {label}
        {optioneel ? <span className="ml-1.5 font-normal text-inkt-zacht">(optioneel)</span> : null}
      </label>
      <Input id={id} name={id} required={!optioneel} {...props} />
    </div>
  );
}

function Keuzekaart({
  naam,
  waarde,
  gekozen,
  bijKeuze,
  icoon: Icoon,
  titel,
  tekst,
}: {
  naam: string;
  waarde: string;
  gekozen: boolean;
  bijKeuze: () => void;
  icoon: typeof Truck;
  titel: string;
  tekst: string;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-all duration-300",
        gekozen ? "border-salie-700 bg-salie-50" : "border-border hover:border-salie-400",
      )}
    >
      <input
        type="radio"
        name={naam}
        value={waarde}
        checked={gekozen}
        onChange={bijKeuze}
        className="sr-only"
      />
      <Icoon className={cn("mt-0.5 size-5 shrink-0", gekozen ? "text-salie-700" : "text-inkt-zacht")} />
      <span className="min-w-0">
        <span className="block text-sm font-medium">{titel}</span>
        <span className="mt-0.5 block text-xs leading-relaxed text-inkt-zacht">{tekst}</span>
      </span>
    </label>
  );
}
