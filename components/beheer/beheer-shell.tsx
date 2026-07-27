"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Menu, Search } from "lucide-react";

import { UkmLogo } from "@/components/merk/ukm-logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { alleBeheerlinks, beheernavigatie } from "./navigatie";
import { formatDatumLang } from "@/lib/format";
import { peildatumLabel } from "@/data/beheer/statistieken";
import { cn } from "@/lib/utils";

export function BeheerShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const huidige = alleBeheerlinks.find((link) => link.href === pathname);

  return (
    <div className="flex min-h-dvh bg-creme">
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col overflow-y-auto bg-inkt lg:flex">
        <Zijbalkinhoud pathname={pathname} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-border/70 glas">
          <div className="flex h-16 items-center gap-4 px-5 lg:px-8">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon-sm" className="lg:hidden" aria-label="Menu openen">
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" title="Beheermenu" className="w-72 bg-inkt p-0">
                <Zijbalkinhoud pathname={pathname} sluitbaar />
              </SheetContent>
            </Sheet>

            <div className="min-w-0">
              <h1 className="truncate font-display text-lg font-semibold">{huidige?.label ?? "Beheer"}</h1>
              <p className="hidden text-xs text-inkt-zacht sm:block">
                Bijgewerkt {formatDatumLang(peildatumLabel)}
              </p>
            </div>

            <div className="ml-auto flex items-center gap-3">
              <div className="relative hidden md:block">
                <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-inkt-zacht" />
                <input
                  type="search"
                  placeholder="Zoeken in beheer"
                  aria-label="Zoeken in beheer"
                  className="h-9 w-56 rounded-full border border-input bg-white pr-4 pl-10 text-sm outline-none transition-colors focus:border-salie-400 focus:ring-2 focus:ring-salie-300/40"
                />
              </div>

              <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
                <Link href="/">
                  Naar de winkel
                  <ArrowUpRight />
                </Link>
              </Button>

              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-salie-200 font-display text-xs font-semibold text-salie-800">
                RA
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 px-5 py-8 lg:px-8 lg:py-10">{children}</main>
      </div>
    </div>
  );
}

function Zijbalkinhoud({ pathname, sluitbaar = false }: { pathname: string; sluitbaar?: boolean }) {
  const Wikkel = sluitbaar ? SheetClose : React.Fragment;

  return (
    <>
      <div className="border-b border-white/10 px-6 py-6">
        <Link href="/beheer">
          <UkmLogo toon="wit" />
        </Link>
        <p className="mt-2 font-display text-[0.625rem] font-semibold tracking-[0.16em] text-white/45 uppercase">
          Beheerpaneel
        </p>
      </div>

      <nav className="flex-1 px-3 py-5" aria-label="Beheernavigatie">
        {beheernavigatie.map((groep) => (
          <div key={groep.titel} className="mb-6">
            <p className="mb-2 px-3 font-display text-[0.625rem] font-semibold tracking-[0.14em] text-white/35 uppercase">
              {groep.titel}
            </p>
            <ul className="space-y-0.5">
              {groep.links.map((link) => {
                const actief = pathname === link.href;
                return (
                  <li key={link.href}>
                    <Wikkel {...(sluitbaar ? { asChild: true } : {})}>
                      <Link
                        href={link.href}
                        aria-current={actief ? "page" : undefined}
                        className={cn(
                          "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                          actief
                            ? "bg-white/12 font-medium text-white"
                            : "text-white/65 hover:bg-white/6 hover:text-white",
                        )}
                      >
                        <link.icoon className="size-4 shrink-0" />
                        {link.label}
                      </Link>
                    </Wikkel>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 px-6 py-5">
        <p className="text-xs leading-relaxed text-white/45">
          Demonstratie met voorbeeldgegevens. Er is geen koppeling met een kassasysteem.
        </p>
      </div>
    </>
  );
}
