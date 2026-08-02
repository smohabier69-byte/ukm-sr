"use client";

import * as React from "react";
import { useActionState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, MapPin, Plus, Star, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { voegAdresToe, verwijderAdres, type ActieResultaat } from "@/app/(winkel)/account/acties";
import type { addresses } from "@/lib/db/schema";

type Adres = typeof addresses.$inferSelect;

const beginstaat: ActieResultaat = { succes: false };

export function AdressenBeheer({ adressen }: { adressen: Adres[] }) {
  const [open, setOpen] = React.useState(false);
  const [staat, actie, bezig] = useActionState(voegAdresToe, beginstaat);
  const router = useRouter();

  React.useEffect(() => {
    if (staat.succes) {
      setOpen(false);
      router.refresh();
    }
  }, [staat.succes, router]);

  return (
    <div>
      {adressen.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-white/60 px-6 py-14 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-salie-100 text-salie-700">
            <MapPin className="size-5" />
          </span>
          <p className="mt-4 text-sm text-inkt-zacht">Nog geen adres opgeslagen.</p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {adressen.map((adres) => (
            <AdresKaart key={adres.id} adres={adres} />
          ))}
        </ul>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="mt-6">
            <Plus />
            Adres toevoegen
          </Button>
        </DialogTrigger>
        <DialogContent title="Nieuw adres">
          <DialogDescription>Voor bezorging en om sneller af te rekenen.</DialogDescription>

          <form action={actie} className="mt-5 space-y-4">
            <Veld id="label" label="Naam voor dit adres" placeholder="Thuis, werk..." />
            <Veld id="naam" label="Naam ontvanger" />
            <Veld id="straat" label="Straat en huisnummer" />
            <div className="grid grid-cols-2 gap-4">
              <Veld id="wijk" label="Wijk" optioneel />
              <Veld id="plaats" label="Plaats" />
            </div>
            <Veld id="telefoon" label="Telefoonnummer" type="tel" optioneel />

            <div className="flex items-center gap-3">
              <Checkbox id="isStandaard" name="isStandaard" />
              <Label htmlFor="isStandaard" className="cursor-pointer font-normal">
                Als standaardadres instellen
              </Label>
            </div>

            {staat.fout ? (
              <p className="flex items-start gap-2 text-sm text-koraal">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                {staat.fout}
              </p>
            ) : null}

            <Button type="submit" className="w-full" disabled={bezig}>
              {bezig ? "Bezig..." : "Adres opslaan"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AdresKaart({ adres }: { adres: Adres }) {
  const [bezig, startTransition] = useTransition();
  const router = useRouter();

  return (
    <li className="rounded-2xl border border-border/70 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="flex items-center gap-2 font-display font-semibold">
          {adres.label}
          {adres.isStandaard ? <Star className="size-3.5 fill-goud text-goud" /> : null}
        </p>
        <button
          type="button"
          disabled={bezig}
          onClick={() => startTransition(async () => { await verwijderAdres(adres.id); router.refresh(); })}
          aria-label={`Adres ${adres.label} verwijderen`}
          className="rounded-full p-1.5 text-inkt-zacht transition-colors hover:bg-koraal/10 hover:text-koraal disabled:opacity-40"
        >
          <Trash2 className="size-4" />
        </button>
      </div>
      <p className="mt-2 text-sm text-inkt-zacht">{adres.naam}</p>
      <p className="text-sm text-inkt-zacht">
        {adres.straat}
        {adres.wijk ? `, ${adres.wijk}` : ""}, {adres.plaats}
      </p>
      {adres.telefoon ? <p className="mt-1 text-sm text-inkt-zacht">{adres.telefoon}</p> : null}
    </li>
  );
}

function Veld({
  id,
  label,
  optioneel = false,
  ...props
}: React.ComponentProps<typeof Input> & { id: string; label: string; optioneel?: boolean }) {
  return (
    <div>
      <Label htmlFor={id} className="mb-2 block">
        {label}
        {optioneel ? <span className="ml-1.5 font-normal text-inkt-zacht">(optioneel)</span> : null}
      </Label>
      <Input id={id} name={id} required={!optioneel} {...props} />
    </div>
  );
}
