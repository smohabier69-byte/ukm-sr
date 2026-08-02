"use client";

import * as React from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { logIn, type ActieResultaat } from "@/app/(winkel)/account/acties";

const beginstaat: ActieResultaat = { succes: false };

export function Inlogformulier() {
  const router = useRouter();
  const { update: verversSessie } = useSession();
  const [staat, actie, bezig] = useActionState(logIn, beginstaat);
  const afgehandeld = React.useRef(false);

  React.useEffect(() => {
    if (!staat.succes || afgehandeld.current) return;
    afgehandeld.current = true;
    // `update` is niet stabiel tussen renders - alleen staat.succes als
    // dependency, anders veroorzaakt de refresh hieronder een lus.
    void verversSessie().then(() => {
      router.push("/account");
      router.refresh();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [staat.succes]);

  return (
    <form action={actie} className="space-y-5">
      <div>
        <Label htmlFor="in-email" className="mb-2 block">
          E-mailadres
        </Label>
        <Input id="in-email" name="email" type="email" autoComplete="email" required />
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <Label htmlFor="in-wachtwoord">Wachtwoord</Label>
          <Link href="/account/wachtwoord-vergeten" className="text-xs font-medium text-salie-700 hover:underline">
            Wachtwoord vergeten?
          </Link>
        </div>
        <Input id="in-wachtwoord" name="wachtwoord" type="password" autoComplete="current-password" required />
      </div>

      {staat.fout ? (
        <p className="flex items-start gap-2 text-sm text-koraal">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          {staat.fout}
        </p>
      ) : null}

      <Button type="submit" size="lg" className="w-full" disabled={bezig}>
        {bezig ? "Bezig..." : "Inloggen"}
      </Button>
    </form>
  );
}
