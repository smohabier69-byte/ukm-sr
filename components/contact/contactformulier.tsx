"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Check, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const onderwerpen = [
  "Vraag over een montuur",
  "Vraag over lenzen of sterkte",
  "Bestelling of bezorging",
  "Iets anders",
];

/**
 * Contactformulier van de demonstratie. Er gaat niets naar een server; de
 * bevestiging zegt dat er ook expliciet bij, zodat niemand op antwoord wacht.
 */
export function Contactformulier() {
  const [verzonden, setVerzonden] = React.useState(false);

  if (verzonden) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="mt-7 rounded-2xl bg-salie-50 p-7 text-center"
      >
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-salie-200 text-salie-800">
          <Check className="size-6" />
        </span>
        <p className="mt-4 font-display text-lg font-semibold">Bedankt voor uw bericht</p>
        <p className="mt-2 text-sm leading-relaxed text-inkt-zacht">
          In deze demonstratie is er niets verstuurd en zijn uw gegevens niet opgeslagen. Neem voor een echte vraag
          contact op via WhatsApp of telefoon.
        </p>
        <Button variant="outline" size="sm" className="mt-5" onClick={() => setVerzonden(false)}>
          Formulier opnieuw tonen
        </Button>
      </motion.div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setVerzonden(true);
      }}
      className="mt-7 space-y-4"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Veld id="contact-naam" label="Naam" autoComplete="name" />
        <Veld id="contact-telefoon" label="Telefoonnummer" type="tel" autoComplete="tel" />
      </div>

      <Veld id="contact-email" label="E-mailadres" type="email" autoComplete="email" />

      <div>
        <label htmlFor="contact-onderwerp" className="mb-2 block text-sm font-medium">
          Onderwerp
        </label>
        <select
          id="contact-onderwerp"
          name="onderwerp"
          className="h-11 w-full rounded-full border border-input bg-white px-4 text-sm outline-none transition-colors focus:border-salie-400 focus:ring-2 focus:ring-salie-300/40"
        >
          {onderwerpen.map((onderwerp) => (
            <option key={onderwerp}>{onderwerp}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="contact-bericht" className="mb-2 block text-sm font-medium">
          Bericht
        </label>
        <textarea
          id="contact-bericht"
          name="bericht"
          rows={5}
          required
          placeholder="Waarmee kunnen we u helpen?"
          className="w-full rounded-2xl border border-input bg-white px-4 py-3 text-sm outline-none transition-colors placeholder:text-inkt-zacht/70 focus:border-salie-400 focus:ring-2 focus:ring-salie-300/40"
        />
      </div>

      <Button type="submit" size="lg" className="w-full">
        <Send />
        Bericht versturen
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
      <label htmlFor={id} className="mb-2 block text-sm font-medium">
        {label}
      </label>
      <Input id={id} name={id} required {...props} />
    </div>
  );
}
