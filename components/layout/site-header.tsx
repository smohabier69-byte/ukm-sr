"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Heart, Menu, Search, ShoppingBag, User } from "lucide-react";
import { useSession } from "next-auth/react";

import { UkmLogo } from "@/components/merk/ukm-logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { bedrijf } from "@/lib/site";
import { formatPrijs } from "@/lib/format";
import { cn } from "@/lib/utils";
import { normaliseerTekst, zoekInIndex } from "@/lib/zoeken";
import { useWinkelHydratie, useWinkelwagenAantal } from "@/lib/winkel/stores";
import { useVerlanglijstGereed, useVerlanglijstSlugs } from "@/lib/winkel/verlanglijst-actief";
import type { Zoekindexitem } from "@/data/zoekindex";
import { categorieen, hoofdcategorieen, categorieOpSlug } from "@/data/categorieen";
import { merken } from "@/data/merken";
import { hoofdnavigatie } from "./navigatie-data";

interface SuggestieDoel {
  naam: string;
  href: string;
  zoektekst: string;
}

/**
 * Categorieen en merken zijn al onderdeel van de headerbundel (voor het
 * megamenu), dus deze suggestie-index kost geen extra ophaalverzoek zoals de
 * productindex hieronder wel doet.
 */
const categorieSuggesties: SuggestieDoel[] = [...hoofdcategorieen, ...categorieen].map((c) => ({
  naam: c.naam,
  href: `/categorie/${c.slug}`,
  zoektekst: normaliseerTekst(c.naam),
}));

const merkSuggesties: SuggestieDoel[] = merken.map((m) => ({
  naam: m.naam,
  href: `/merken/${m.slug}`,
  zoektekst: normaliseerTekst(`${m.naam} ${m.positionering}`),
}));

export function SiteHeader() {
  const [gescrold, setGescrold] = React.useState(false);
  const [zoekenOpen, setZoekenOpen] = React.useState(false);
  const [megaOpen, setMegaOpen] = React.useState(false);
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
    setMegaOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    if (!megaOpen && !zoekenOpen) return;
    const bijToets = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMegaOpen(false);
        setZoekenOpen(false);
      }
    };
    window.addEventListener("keydown", bijToets);
    return () => window.removeEventListener("keydown", bijToets);
  }, [megaOpen, zoekenOpen]);

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

  const suggesties = React.useMemo(() => zoekInIndex(zoekindex, zoekterm, 5), [zoekindex, zoekterm]);
  const categorieTreffers = React.useMemo(() => zoekInIndex(categorieSuggesties, zoekterm, 3), [zoekterm]);
  const merkTreffers = React.useMemo(() => zoekInIndex(merkSuggesties, zoekterm, 3), [zoekterm]);

  // De tellers blijven op nul tot de opgeslagen staat is ingelezen, zodat de
  // eerste render op de client gelijk is aan de HTML van de server.
  const gehydrateerd = useWinkelHydratie();
  const wagenAantal = useWinkelwagenAantal();
  const verlanglijstGereed = useVerlanglijstGereed();
  const bewaardAantal = useVerlanglijstSlugs().length;
  const aantalInWagen = gehydrateerd ? wagenAantal : 0;
  const aantalBewaard = verlanglijstGereed ? bewaardAantal : 0;
  const { data: sessie } = useSession();

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
            <button
              type="button"
              aria-expanded={megaOpen}
              aria-controls="megamenu-categorieen"
              onClick={() => {
                setMegaOpen((v) => !v);
                setZoekenOpen(false);
              }}
              className={cn(
                "group flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium text-inkt transition-colors hover:text-salie-700",
                megaOpen && "text-salie-700",
              )}
            >
              Categorieën
              <ChevronDown className={cn("size-3.5 transition-transform duration-200", megaOpen && "rotate-180")} />
            </button>

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
              onClick={() => {
                setZoekenOpen((v) => !v);
                setMegaOpen(false);
              }}
            >
              <Search />
            </Button>
            <Button variant="ghost" size="icon-sm" asChild aria-label={`Verlanglijst, ${aantalBewaard} artikelen`}>
              <Link href="/verlanglijst" className="relative">
                <Heart />
                <Teller aantal={aantalBewaard} />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              asChild
              aria-label={sessie?.user ? `Mijn account (${sessie.user.name ?? sessie.user.email})` : "Mijn account"}
              className="hidden sm:inline-flex"
            >
              <Link href="/account" className="relative">
                <User className={cn(sessie?.user && "text-salie-700")} />
                {sessie?.user ? (
                  <span className="absolute top-0.5 right-0.5 size-2 rounded-full bg-salie-600 ring-2 ring-white" />
                ) : null}
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

      {/* Megamenu */}
      <AnimatePresence>
        {megaOpen ? (
          <motion.div
            id="megamenu-categorieen"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-border/60 glas"
          >
            <div className="container-ukm grid gap-8 py-8 lg:grid-cols-[1fr_1fr_1fr_1.1fr]">
              {hoofdcategorieen.map((hoofd) => (
                <div key={hoofd.slug}>
                  <Link
                    href={`/categorie/${hoofd.slug}`}
                    className="font-display text-sm font-semibold text-inkt transition-colors hover:text-salie-700"
                  >
                    {hoofd.naam}
                  </Link>
                  <ul className="mt-3 space-y-2.5">
                    {hoofd.subcategorieen.map((slug) => {
                      const sub = categorieOpSlug(slug);
                      if (!sub) return null;
                      return (
                        <li key={slug}>
                          <Link
                            href={`/categorie/${slug}`}
                            className="text-sm text-inkt-zacht transition-colors hover:text-salie-700"
                          >
                            {sub.naam}
                          </Link>
                        </li>
                      );
                    })}
                    <li>
                      <Link
                        href={`/categorie/${hoofd.slug}`}
                        className="text-sm font-medium text-salie-700 transition-colors hover:text-salie-800"
                      >
                        Alles bekijken →
                      </Link>
                    </li>
                  </ul>
                </div>
              ))}

              <div>
                <p className="font-display text-sm font-semibold text-inkt">Huislijnen</p>
                <ul className="mt-3 space-y-2.5">
                  {merken.map((merk) => (
                    <li key={merk.slug}>
                      <Link
                        href={`/merken/${merk.slug}`}
                        className="text-sm text-inkt-zacht transition-colors hover:text-salie-700"
                      >
                        {merk.naam}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                href="/categorie/ptc"
                className="group relative hidden overflow-hidden rounded-2xl bg-creme-diep lg:block"
              >
                <Image
                  src="/producten/brillen/brillen-p036-1.jpg"
                  alt=""
                  fill
                  sizes="20vw"
                  className="object-cover object-top transition-transform duration-700 ease-[var(--ease-uit)] group-hover:scale-105"
                />
                <div className="overlay-onder absolute inset-0 flex flex-col justify-end p-5">
                  <p className="text-xs font-medium text-white/80">Uitgelicht</p>
                  <p className="font-display text-base font-semibold text-white">PTC photochroom</p>
                  <p className="mt-1 text-sm text-white/85">Helder binnen, donker in de zon.</p>
                </div>
              </Link>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

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

              {categorieTreffers.length > 0 || merkTreffers.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2 border-t border-border/60 pt-3">
                  {[...categorieTreffers, ...merkTreffers].map((doel) => (
                    <Link
                      key={doel.href}
                      href={doel.href}
                      className="rounded-full border border-border bg-white px-3 py-1.5 text-xs font-medium text-inkt-zacht transition-colors hover:border-salie-300 hover:text-salie-700"
                    >
                      {doel.naam}
                    </Link>
                  ))}
                </div>
              ) : null}

              {suggesties.length > 0 ? (
                <ul
                  className={cn(
                    "grid gap-1 sm:grid-cols-2",
                    categorieTreffers.length > 0 || merkTreffers.length > 0
                      ? "mt-3"
                      : "mt-3 border-t border-border/60 pt-3",
                  )}
                >
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
        {hoofdcategorieen.map((hoofd) => (
          <div key={hoofd.slug} className="mb-7">
            <SheetClose asChild>
              <Link href={`/categorie/${hoofd.slug}`} className="font-display text-xl font-semibold">
                {hoofd.naam}
              </Link>
            </SheetClose>
            <ul className="mt-3 space-y-2.5 border-l border-border pl-4">
              {hoofd.subcategorieen.map((slug) => {
                const sub = categorieOpSlug(slug);
                if (!sub) return null;
                return (
                  <li key={slug}>
                    <SheetClose asChild>
                      <Link
                        href={`/categorie/${slug}`}
                        className="text-sm text-inkt-zacht transition-colors hover:text-salie-700"
                      >
                        {sub.naam}
                      </Link>
                    </SheetClose>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

        <div className="mb-7">
          <p className="font-display text-xl font-semibold">Huislijnen</p>
          <ul className="mt-3 space-y-2.5 border-l border-border pl-4">
            {merken.map((merk) => (
              <li key={merk.slug}>
                <SheetClose asChild>
                  <Link
                    href={`/merken/${merk.slug}`}
                    className="text-sm text-inkt-zacht transition-colors hover:text-salie-700"
                  >
                    {merk.naam}
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
