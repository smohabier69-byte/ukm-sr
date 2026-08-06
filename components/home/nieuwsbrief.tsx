"use client";

import { useActionState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, Check, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { meldAanVoorNieuwsbrief, type ActieResultaat } from "./nieuwsbrief-acties";

const beginstaat: ActieResultaat = { succes: false };

export function Nieuwsbrief() {
  const [staat, actie, bezig] = useActionState(meldAanVoorNieuwsbrief, beginstaat);

  return (
    <section className="container-ukm py-14 lg:py-20">
      <div className="relative overflow-hidden rounded-3xl bg-salie-700 px-6 py-14 text-center sm:px-12 lg:py-20">
        <div aria-hidden className="pointer-events-none absolute -top-24 -right-16 size-72 rounded-full bg-salie-500/40 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-28 -left-10 size-72 rounded-full bg-salie-800/50 blur-3xl" />

        <div className="relative mx-auto max-w-xl">
          <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-white/15 text-white">
            <Mail className="size-5" />
          </span>

          <h2 className="mt-6 font-display text-3xl font-bold text-white sm:text-4xl">
            Als eerste weten wat er binnenkomt?
          </h2>
          <p className="mt-4 leading-relaxed text-salie-100">
            Nieuwe modellen, acties en kleuren die terug op voorraad zijn. Hooguit twee berichten per maand.
          </p>

          {staat.succes ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="mt-9 rounded-2xl bg-white/12 p-6"
            >
              <p className="flex items-center justify-center gap-2 font-display text-lg font-semibold text-white">
                <Check className="size-5" />
                Bedankt voor uw aanmelding
              </p>
            </motion.div>
          ) : (
            <>
              <form action={actie} className="mx-auto mt-9 flex max-w-md flex-col gap-3 sm:flex-row">
                <label htmlFor="nieuwsbrief-email" className="sr-only">
                  E-mailadres
                </label>
                <Input
                  id="nieuwsbrief-email"
                  name="email"
                  type="email"
                  required
                  placeholder="uw@email.sr"
                  className="flex-1 border-transparent bg-white/95"
                />
                <Button type="submit" variant="wit" className="sm:px-8" disabled={bezig}>
                  {bezig ? "Bezig..." : "Aanmelden"}
                </Button>
              </form>
              {staat.fout ? (
                <p className="mt-3 flex items-center justify-center gap-2 text-sm text-white">
                  <AlertCircle className="size-4 shrink-0" />
                  {staat.fout}
                </p>
              ) : null}
            </>
          )}

          <p className="mt-5 text-xs text-salie-200">
            Afmelden kan altijd. Lees ons{" "}
            <a href="/privacybeleid" className="underline underline-offset-4 hover:text-white">
              privacybeleid
            </a>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
