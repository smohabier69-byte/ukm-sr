"use client";

import { useActionState } from "react";
import { Mail } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { vraagWachtwoordHerstelAan, type ActieResultaat } from "@/app/(winkel)/account/acties";

const beginstaat: ActieResultaat = { succes: false };

export function WachtwoordVergetenFormulier() {
  const [staat, actie, bezig] = useActionState(vraagWachtwoordHerstelAan, beginstaat);

  if (staat.succes) {
    return (
      <div className="flex items-start gap-3 rounded-2xl bg-salie-50 p-5">
        <Mail className="mt-0.5 size-5 shrink-0 text-salie-700" />
        <p className="text-sm text-inkt-zacht">
          Staat dit e-mailadres bij ons bekend, dan ontvang je binnen enkele minuten een link om een nieuw
          wachtwoord in te stellen.
        </p>
      </div>
    );
  }

  return (
    <form action={actie} className="space-y-5">
      <div>
        <Label htmlFor="herstel-email" className="mb-2 block">
          E-mailadres
        </Label>
        <Input id="herstel-email" name="email" type="email" autoComplete="email" required />
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={bezig}>
        {bezig ? "Bezig..." : "Herstellink versturen"}
      </Button>
    </form>
  );
}
