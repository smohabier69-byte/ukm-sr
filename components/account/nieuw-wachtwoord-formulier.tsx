"use client";

import * as React from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { herstelWachtwoord, type ActieResultaat } from "@/app/(winkel)/account/acties";

const beginstaat: ActieResultaat = { succes: false };

export function NieuwWachtwoordFormulier({ token }: { token: string }) {
  const router = useRouter();
  const [staat, actie, bezig] = useActionState(herstelWachtwoord, beginstaat);

  React.useEffect(() => {
    if (staat.succes) {
      const timer = setTimeout(() => router.push("/account"), 1800);
      return () => clearTimeout(timer);
    }
  }, [staat.succes, router]);

  if (staat.succes) {
    return (
      <div className="flex items-start gap-3 rounded-2xl bg-salie-100 p-5 text-salie-800">
        <CheckCircle2 className="mt-0.5 size-5 shrink-0" />
        <p className="text-sm">Wachtwoord bijgewerkt. Je wordt zo doorgestuurd om in te loggen.</p>
      </div>
    );
  }

  return (
    <form action={actie} className="space-y-5">
      <input type="hidden" name="token" value={token} />

      <div>
        <Label htmlFor="nieuw-wachtwoord" className="mb-2 block">
          Nieuw wachtwoord
        </Label>
        <Input id="nieuw-wachtwoord" name="wachtwoord" type="password" autoComplete="new-password" minLength={8} required />
      </div>

      {staat.fout ? (
        <p className="flex items-start gap-2 text-sm text-koraal">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          {staat.fout}
        </p>
      ) : null}

      <Button type="submit" size="lg" className="w-full" disabled={bezig}>
        {bezig ? "Bezig..." : "Wachtwoord instellen"}
      </Button>
    </form>
  );
}
