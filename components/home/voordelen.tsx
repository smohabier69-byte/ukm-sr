import { MessageCircle, ShieldCheck, Store, Truck } from "lucide-react";

import { OnthulGroep, OnthulKind } from "@/components/motion/onthul";
import { voordelen } from "@/lib/site";

const iconen = { Truck, Store, ShieldCheck, MessageCircle } as const;

export function Voordelen() {
  return (
    <section className="container-ukm py-14 lg:py-20">
      <OnthulGroep className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {voordelen.map((voordeel) => {
          const Icoon = iconen[voordeel.icoon as keyof typeof iconen];
          return (
            <OnthulKind key={voordeel.titel}>
              <div className="flex h-full flex-col rounded-2xl border border-border/70 bg-white p-6">
                <span className="flex size-11 items-center justify-center rounded-full bg-salie-100 text-salie-700">
                  <Icoon className="size-5" />
                </span>
                <h3 className="mt-5 font-display text-base font-semibold">{voordeel.titel}</h3>
                <p className="mt-2 text-sm leading-relaxed text-inkt-zacht">{voordeel.tekst}</p>
              </div>
            </OnthulKind>
          );
        })}
      </OnthulGroep>
    </section>
  );
}
