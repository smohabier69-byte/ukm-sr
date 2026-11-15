import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Onthul } from "@/components/motion/onthul";
import { cn } from "@/lib/utils";

/**
 * Kop boven een sectie. `titel` mag opmaak bevatten: een `<em>` erin wordt het
 * cursieve salie-accent van de huisstijl.
 */
export function Sectiekop({
  bovenschrift,
  titel,
  tekst,
  link,
  gecentreerd = false,
  className,
}: {
  bovenschrift?: string;
  titel: React.ReactNode;
  tekst?: string;
  link?: { label: string; href: string };
  gecentreerd?: boolean;
  className?: string;
}) {
  return (
    <Onthul
      className={cn(
        "mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between",
        gecentreerd && "sm:flex-col sm:items-center sm:text-center",
        className,
      )}
    >
      <div className={cn("max-w-2xl", gecentreerd && "mx-auto text-center")}>
        {bovenschrift ? (
          <p
            className={cn(
              "inline-flex items-center gap-2.5 text-salie-600 bovenschrift",
              gecentreerd && "justify-center",
            )}
          >
            <span aria-hidden className="h-px w-6 bg-salie-300" />
            {bovenschrift}
            {gecentreerd ? <span aria-hidden className="h-px w-6 bg-salie-300" /> : null}
          </p>
        ) : null}
        <h2 className="mt-3 font-display text-3xl font-semibold sm:text-[2.625rem] sm:leading-[1.08]">{titel}</h2>
        {tekst ? <p className="mt-4 leading-relaxed text-inkt-zacht">{tekst}</p> : null}
      </div>

      {link ? (
        <Link
          href={link.href}
          className="group inline-flex shrink-0 items-center gap-2 rounded-full border border-salie-700/20 bg-white/60 px-4 py-2 text-sm font-medium text-salie-800 transition-colors hover:border-salie-700/45 hover:bg-white"
        >
          {link.label}
          <ArrowRight className="size-4 transition-transform duration-300 ease-[var(--ease-uit)] group-hover:translate-x-1" />
        </Link>
      ) : null}
    </Onthul>
  );
}
