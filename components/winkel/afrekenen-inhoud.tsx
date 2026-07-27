"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Banknote, Building2, CheckCircle2, CreditCard, Info, MapPin, ShoppingBag, Truck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Kostenregels } from "@/components/winkel/kostenoverzicht";
import { useWinkelHydratie, useWinkelwagen } from "@/lib/winkel/stores";
import { berekenKosten, bouwPosten } from "@/lib/winkel/prijzen";
import { formatPrijs } from "@/lib/format";
import { bedrijf } from "@/lib/site";
import { cn } from "@/lib/utils";

type Bezorgwijze = "bezorgen" | "afhalen";
type Betaalwijze = "contant" | "overschrijving" | "pin";

const betaalwijzen: { id: Betaalwijze; label: string; tekst: string; icoon: typeof Banknote }[] = [
  { id: "contant", label: "Contant", tekst: "Betaal bij ontvangst of in de winkel", icoon: Banknote },
  { id: "overschrijving", label: "Bankoverschrijving", tekst: "Je ontvangt de gegevens per bericht", icoon: Building2 },
  { id: "pin", label: "Pinnen", tekst: "Met de mobiele pinautomaat of in de winkel", icoon: CreditCard },
];

export function AfrekenenInhoud() {
  const gehydrateerd = useWinkelHydratie();
  const regels = useWinkelwagen((staat) => staat.regels);
  const kortingscode = useWinkelwagen((staat) => staat.kortingscode);

  const [bezorgwijze, setBezorgwijze] = React.useState<Bezorgwijze>("bezorgen");
  const [betaalwijze, setBetaalwijze] = React.useState<Betaalwijze>("contant");
  const [verzonden, setVerzonden] = React.useState(false);

  const posten = React.useMemo(() => bouwPosten(regels), [regels]);
  const kosten = React.useMemo(
    () => berekenKosten(posten, bezorgwijze === "afhalen" ? "GRATISBEZORGING" : kortingscode),
    [posten, kortingscode, bezorgwijze],
  );

  if (!gehydrateerd) {
    return (
      <div className="grid gap-10 lg:grid-cols-[1fr_22rem]" aria-busy>
        <Skeleton className="h-[32rem] rounded-3xl" />
        <Skeleton className="h-80 rounded-3xl" />
      </div>
    );
  }

  if (verzonden) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto max-w-xl rounded-3xl border border-border/70 bg-white p-10 text-center"
      >
        <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-salie-100 text-salie-700">
          <CheckCircle2 className="size-8" />
        </span>
        <h2 className="mt-7 font-display text-2xl font-bold">Zo zou een bestelling eruitzien</h2>
        <p className="mt-4 leading-relaxed text-inkt-zacht">
          Er is niets verstuurd en er zijn geen gegevens opgeslagen. Deze website is een demonstratie, gemaakt voor
          UKM. Wilt u werkelijk bestellen, neem dan contact op via WhatsApp of kom langs in de winkel.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/contact">Contact opnemen</Link>
          </Button>
          <Button asChild size="lg" variant="outline" onClick={() => setVerzonden(false)}>
            <Link href="/producten">Verder kijken</Link>
          </Button>
        </div>
      </motion.div>
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

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setVerzonden(true);
      }}
      className="grid gap-10 lg:grid-cols-[1fr_22rem] lg:gap-14"
    >
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
              <Veld id="wijk" label="Wijk of buurt" />
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
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
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

          <Button type="submit" size="lg" className="mt-7 w-full">
            Bestelling plaatsen
          </Button>

          <p className="mt-4 flex items-start gap-2 rounded-xl bg-creme-diep p-3 text-xs leading-relaxed text-inkt-zacht">
            <Info className="mt-0.5 size-3.5 shrink-0" />
            Deze website is een demonstratie, gemaakt voor UKM. Er wordt niets verstuurd, opgeslagen of afgerekend.
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
