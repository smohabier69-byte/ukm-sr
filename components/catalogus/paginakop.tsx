import Image from "next/image";

import { Kruimelpad, type Kruimel } from "@/components/ui/kruimelpad";
import { Onthul } from "@/components/motion/onthul";
import { cn } from "@/lib/utils";

/** Kop van elke overzichtspagina: kruimelpad, titel, inleiding en optioneel een sfeerbeeld. */
export function Paginakop({
  kruimels,
  titel,
  tekst,
  afbeelding,
  aantal,
  className,
}: {
  kruimels: Kruimel[];
  titel: string;
  tekst?: string;
  afbeelding?: string;
  aantal?: number;
  className?: string;
}) {
  return (
    <div className={cn("border-b border-border/70 bg-salie-50/50", className)}>
      <div className="container-ukm py-8 lg:py-12">
        <Kruimelpad kruimels={kruimels} className="mb-6" />

        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <Onthul className="max-w-2xl">
            <h1 className="font-display text-3xl font-bold sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
              {titel}
            </h1>
            {tekst ? <p className="mt-4 leading-relaxed text-inkt-zacht">{tekst}</p> : null}
            {aantal !== undefined ? (
              <p className="mt-4 text-sm text-inkt-zacht">
                {aantal} {aantal === 1 ? "artikel" : "artikelen"} in deze collectie
              </p>
            ) : null}
          </Onthul>

          {afbeelding ? (
            <Onthul richting="links" vertraging={0.1} className="shrink-0">
              <div className="relative h-40 w-full overflow-hidden rounded-2xl bg-creme-diep shadow-zacht lg:h-44 lg:w-80">
                <Image
                  src={afbeelding}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 20rem, 100vw"
                  className="object-cover object-top"
                />
              </div>
            </Onthul>
          ) : null}
        </div>
      </div>
    </div>
  );
}
