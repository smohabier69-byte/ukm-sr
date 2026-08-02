"use client";

import * as React from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { registreer, type ActieResultaat } from "@/app/(winkel)/account/acties";

const beginstaat: ActieResultaat = { succes: false };

export function Registratieformulier() {
  const router = useRouter();
  const [staat, actie, bezig] = useActionState(registreer, beginstaat);

  React.useEffect(() => {
    if (staat.succes) {
      router.push("/account");
      router.refresh();
    }
  }, [staat.succes, router]);

  return (
    <form action={actie} className="space-y-5">
      <Veld id="naam" label="Naam" autoComplete="name" />
      <Veld id="email" label="E-mailadres" type="email" autoComplete="email" />
      <Veld id="wachtwoord" label="Wachtwoord" type="password" autoComplete="new-password" minLength={8} />

      {staat.fout ? (
        <p className="flex items-start gap-2 text-sm text-koraal">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          {staat.fout}
        </p>
      ) : null}

      <Button type="submit" size="lg" className="w-full" disabled={bezig}>
        {bezig ? "Bezig..." : "Account aanmaken"}
      </Button>
    </form>
  );
}

function Veld({
  id,
  label,
  ...props
}: React.ComponentProps<typeof Input> & { id: string; label: string }) {
  return (
    <div>
      <Label htmlFor={id} className="mb-2 block">
        {label}
      </Label>
      <Input id={id} name={id} required {...props} />
    </div>
  );
}
