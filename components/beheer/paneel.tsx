import Link from "next/link";
import { ArrowRight, AlertTriangle, CheckCircle2, CircleDot, Clock, Truck, XCircle } from "lucide-react";

import { statuslabels, statustoon, type Bestelstatus } from "@/data/beheer/bestellingen";
import { cn } from "@/lib/utils";

/** Kaart met kop en optionele link, de bouwsteen van elk beheerscherm. */
export function Paneel({
  titel,
  tekst,
  link,
  children,
  className,
}: {
  titel: string;
  tekst?: string;
  link?: { label: string; href: string };
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-2xl border border-border/70 bg-white p-5 sm:p-6", className)}>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-base font-semibold">{titel}</h2>
          {tekst ? <p className="mt-1 text-sm text-inkt-zacht">{tekst}</p> : null}
        </div>
        {link ? (
          <Link
            href={link.href}
            className="group inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-salie-700 transition-colors hover:text-salie-800"
          >
            {link.label}
            <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
          </Link>
        ) : null}
      </div>
      {children}
    </section>
  );
}

const toonstijl = {
  goed: { klasse: "bg-[var(--status-goed)]/12 text-[#0a7d0a]", icoon: CheckCircle2 },
  waarschuwing: { klasse: "bg-[var(--status-waarschuwing)]/18 text-[#8a6100]", icoon: Clock },
  ernstig: { klasse: "bg-[var(--status-ernstig)]/18 text-[#a34e26]", icoon: Truck },
  kritiek: { klasse: "bg-[var(--status-kritiek)]/12 text-[var(--status-kritiek)]", icoon: XCircle },
  neutraal: { klasse: "bg-salie-100 text-salie-800", icoon: CircleDot },
} as const;

/**
 * Statuslabel met pictogram en tekst. De kleur is nooit de enige aanwijzing:
 * het woord staat er altijd bij, en enkele statuskleuren halen op wit geen 3:1.
 */
export function Statuslabel({ status }: { status: Bestelstatus }) {
  const stijl = toonstijl[statustoon[status]];
  const Icoon = stijl.icoon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap",
        stijl.klasse,
      )}
    >
      <Icoon className="size-3.5" />
      {statuslabels[status]}
    </span>
  );
}

/** Waarschuwingslabel voor voorraad. */
export function Voorraadlabel({ voorraad, drempel = 5 }: { voorraad: number; drempel?: number }) {
  if (voorraad === 0) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--status-kritiek)]/12 px-2.5 py-1 text-xs font-medium whitespace-nowrap text-[var(--status-kritiek)]">
        <XCircle className="size-3.5" />
        Uitverkocht
      </span>
    );
  }
  if (voorraad <= drempel) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--status-waarschuwing)]/18 px-2.5 py-1 text-xs font-medium whitespace-nowrap text-[#8a6100]">
        <AlertTriangle className="size-3.5" />
        Nog {voorraad}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-salie-100 px-2.5 py-1 text-xs font-medium whitespace-nowrap text-salie-800">
      <CheckCircle2 className="size-3.5" />
      {voorraad} stuks
    </span>
  );
}

/** Tabel met horizontale schuifruimte, zodat brede kolommen op mobiel werken. */
export function Tabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("-mx-5 overflow-x-auto sm:-mx-6", className)}>
      <div className="inline-block min-w-full px-5 align-middle sm:px-6">
        <table className="min-w-full text-sm">{children}</table>
      </div>
    </div>
  );
}

export function Kop({ children, className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      scope="col"
      className={cn("border-b border-border py-2.5 pr-4 text-left font-medium text-inkt-zacht", className)}
      {...props}
    >
      {children}
    </th>
  );
}

export function Cel({ children, className, ...props }: React.ComponentProps<"td">) {
  return (
    <td className={cn("border-b border-border/60 py-3 pr-4 align-middle", className)} {...props}>
      {children}
    </td>
  );
}
