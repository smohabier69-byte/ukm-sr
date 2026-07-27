"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Heart, Menu, Search, ShoppingBag, User } from "lucide-react";

import { UkmLogo } from "@/components/merk/ukm-logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { bedrijf } from "@/lib/site";
import { formatPrijs } from "@/lib/format";
import { cn } from "@/lib/utils";
import { zoekInIndex } from "@/lib/zoeken";
import { useVerlanglijst, useWinkelHydratie, useWinkelwagenAantal } from "@/lib/winkel/stores";
import type { Zoekindexitem } from "@/data/zoekindex";
import { categorieenDropdown, hoofdnavigatie } from "./navigatie-data";

export function SiteHeader() {
  const [gescrold, setGescrold] = React.useState(false);
  const [zoekenOpen, setZoekenOpen] = React.useState(false);
  const [mobielOpen, setMobielOpen] = React.useState(false);
  const pathname = usePathname();
  const router = useRouter();

  React.useEffect(() => {
    const bijScroll = () => setGescrold(window.scrollY > 12);
    bijScroll();
    window.addEventListener("scroll", bijScroll, { passive: true });
    return () => window.removeEventListener("scroll", bijScroll);
  }, []);

  React.useEffect(() => {
    setMobielOpen(false);
    setZoekenOpen(false);
  }, [pathname]);

  const [zoekterm, setZoekterm] = React.useState("");
  const [zoekindex, setZoekindex] = React.useState<Zoekindexitem[]>([]);

  /*
   * De zoekindex wordt pas opgehaald als het zoekveld opengaat. Zo staat de
   * catalogus niet in de bundel van elke pagina, maar zoekt hij daarna wel
   * volledig in de browser - zonder verzoek per toetsaanslag.
   */
  React.useEffect(() => {
    if (!zoekenOpen || zoekindex.length > 0) return;
    let geannuleerd = false;
    import("@/data/zoekindex").then((module) => {
      if (!geannuleerd) setZoekindex(module.zoekindex);
    });
    return () => {
      geannuleerd = true;
    };
  }, [zoekenOpen, zoekindex.length]);

  const suggesties = React.useMemo(() => zoekInIndex(zoekindex, zoekterm), [zoekindex, zoekterm]);

  // De tellers blijven op nul tot de opgeslagen staat is ingelezen, zodat de
  // eerste render op de client gelijk is aan de HTML van de server.
  const gehydrateerd = useWinkelHydratie();
  const wagenAantal = useWinkelwagenAantal();
  const bewaardAantal = useVerlanglijst((staat) => staat.slugs.length);
  const aantalInWagen = gehydrateerd ? wagenAantal : 0;
  const aantalBewaard = gehydrateerd ? bewaardAantal : 0;

  const zoek = (formulier: React.FormEvent<HTMLFormElement>) => {
    formulier.preventDefault();
    const term = zoekterm.trim();
    if (term) router.push(`/zoeken?q=${encodeURIComponent(term)}`);
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-500 ease-[var(--ease-uit)]",
        gescrold ? "glas border-b border-border/60 shadow-zacht" : "bg-transparent",
      )}
    >
      <div className="container-ukm">
        <div className={cn("flex items-center gap-4 transition-all duration-500", gescrold ? "h-16" : "h-20")}>
          {/* Mobiele navigatie */}
          <Sheet open={mobielOpen} onOpenChange={setMobielOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon-sm" className="lg:hidden" aria-label="Menu openen">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" title="Navigatie" className="p-0">
              <MobieleNavigatie />
            </SheetContent>
          </Sheet>

          <Link href="/" className="mr-2 shrink-0" aria-label={`${bedrijf.naam} - naar de homepagina`}>
            <UkmLogo />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Hoofdnavigatie">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="group flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium text-inkt transition-colors hover:text-salie-700 data-[state=open]:text-salie-700"
                >
                  Categorieën
                  <ChevronDown className="size-3.5 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {categorieenDropdown.map((item) => (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link href={item.href}>{item.label}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {hoofdnavigatie.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full px-4 py-2 text-sm font-medium text-inkt transition-colors hover:text-salie-700"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Zoeken"
              aria-expanded={zoekenOpen}
              onClick={() => setZoekenOpen((v) => !v)}
            >
              <Search />
            </Button>
            <Button variant="ghost" size="icon-sm" asChild aria-label={`Verlanglijst, ${aantalBewaard} artikelen`}>
              <Link href="/verlanglijst" className="relative">
                <Heart />
                <Teller aantal={aantalBewaard} />
              </Link>
            </Button>
            <Button variant="ghost" size="icon-sm" asChild aria-label="Mijn account" className="hidden sm:inline-flex">
              <Link href="/account">
                <User />
              </Link>
            </Button>
            <Button variant="ghost" size="icon-sm" asChild aria-label={`Winkelwagen, ${aantalInWagen} artikelen`}>
              <Link href="/winkelwagen" className="relative">
                <ShoppingBag />
                <Teller aantal={aantalInWagen} />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Zoekbalk */}
      <AnimatePresence>
        {zoekenOpen ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-border/60 glas"
          >
            <div className="container-ukm py-4">
              <form onSubmit={zoek} className="flex items-center gap-3" role="search">
                <Search className="size-5 shrink-0 text-inkt-zacht" />
                <input
                  autoFocus
                  name="q"
                  type="search"
                  value={zoekterm}
                  onChange={(e) => setZoekterm(e.target.value)}
                  placeholder="Zoek op model, kleur of vorm - bijvoorbeeld cat eye of ash grey"
                  aria-label="Zoek in het assortiment"
                  className="h-10 w-full bg-transparent text-base outline-none placeholder:text-inkt-zacht/70"
                />
                <Button type="submit" size="sm">
                  Zoeken
                </Button>
              </form>

              {suggesties.length > 0 ? (
                <ul className="mt-3 grid gap-1 border-t border-border/60 pt-3 sm:grid-cols-2">
                  {suggesties.map((suggestie) => (
                    <li key={suggestie.slug}>
                      <Link
                        href={`/producten/${suggestie.slug}`}
                        className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-salie-50"
                      >
                        <Image
                          src={suggestie.afbeelding}
                          alt=""
                          width={44}
                          height={44}
                          className="size-11 shrink-0 rounded-lg bg-creme-diep object-cover object-top"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium">{suggestie.naam}</span>
                          <span className="block text-xs text-inkt-zacht">{suggestie.categorie}</span>
                        </span>
                        <span className="shrink-0 text-sm font-medium">{formatPrijs(suggestie.prijs)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}

/** Klein telbolletje op de winkelwagen- en verlanglijstknop. */
function Teller({ aantal }: { aantal: number }) {
  if (aantal === 0) return null;

  return (
    <motion.span
      key={aantal}
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 480, damping: 22 }}
      className="absolute -top-0.5 -right-0.5 flex min-w-4 items-center justify-center rounded-full bg-salie-700 px-1 text-[0.625rem] leading-4 font-semibold text-white tabular-nums"
    >
      {aantal > 9 ? "9+" : aantal}
    </motion.span>
  );
}

function MobieleNavigatie() {
  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="border-b border-border px-6 py-6">
        <UkmLogo metTagline />
      </div>

      <nav className="flex-1 px-6 py-6" aria-label="Mobiele navigatie">
        <div className="mb-7">
          <p className="font-display text-xl font-semibold">Categorieën</p>
          <ul className="mt-3 space-y-2.5 border-l border-border pl-4">
            {categorieenDropdown.map((item) => (
              <li key={item.href}>
                <SheetClose asChild>
                  <Link href={item.href} className="text-sm text-inkt-zacht transition-colors hover:text-salie-700">
                    {item.label}
                  </Link>
                </SheetClose>
              </li>
            ))}
          </ul>
        </div>

        <ul className="space-y-4 border-t border-border pt-6">
          {hoofdnavigatie.map((link) => (
            <li key={link.href}>
              <SheetClose asChild>
                <Link href={link.href} className="font-display text-base font-medium">
                  {link.label}
                </Link>
              </SheetClose>
            </li>
          ))}
          <li>
            <SheetClose asChild>
              <Link href="/account" className="font-display text-base font-medium">
                Mijn account
              </Link>
            </SheetClose>
          </li>
        </ul>
      </nav>

      <div className="border-t border-border bg-salie-50 px-6 py-6">
        <p className="text-sm font-medium">{bedrijf.adres.straat}</p>
        <p className="mt-1 text-sm text-inkt-zacht">{bedrijf.telefoon}</p>
        <Button asChild variant="outline" size="sm" className="mt-4 w-full">
          <a href={`tel:${bedrijf.telefoonPlat}`}>Bel de winkel</a>
        </Button>
      </div>
    </div>
  );
}
