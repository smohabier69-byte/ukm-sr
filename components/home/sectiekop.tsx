import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Onthul } from "@/components/motion/onthul";
import { cn } from "@/lib/utils";

export function Sectiekop({
  bovenschrift,
  titel,
  tekst,
  link,
  gecentreerd = false,
  className,
}: {
  bovenschrift?: string;
  titel: string;
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
      <div className={cn("max-w-2xl", gecentreerd && "mx-auto")}>
        {bovenschrift ? (
          <p className="font-display text-[0.6875rem] font-semibold tracking-[0.14em] text-salie-600 uppercase">
            {bovenschrift}
          </p>
        ) : null}
        <h2 className="mt-3 font-display text-3xl font-bold sm:text-[2.5rem] sm:leading-[1.1]">{titel}</h2>
        {tekst ? <p className="mt-4 leading-relaxed text-inkt-zacht">{tekst}</p> : null}
      </div>

      {link ? (
        <Link
          href={link.href}
          className="group inline-flex shrink-0 items-center gap-2 text-sm font-medium text-salie-700 transition-colors hover:text-salie-800"
        >
          {link.label}
          <ArrowRight className="size-4 transition-transform duration-300 ease-[var(--ease-uit)] group-hover:translate-x-1" />
        </Link>
      ) : null}
    </Onthul>
  );
}
