"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, Heart, Menu, Search, ShoppingBag, User } from "lucide-react";

import { UkmLogo } from "@/components/merk/ukm-logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { bedrijf } from "@/lib/site";
import { cn } from "@/lib/utils";
import { megamenus } from "./megamenu-data";

const overigeLinks = [
  { label: "Merken", href: "/merken" },
  { label: "Aanbiedingen", href: "/aanbiedingen" },
  { label: "Over ons", href: "/over-ons" },
  { label: "Contact", href: "/contact" },
];

export function SiteHeader() {
  const [gescrold, setGescrold] = React.useState(false);
  const [openMenu, setOpenMenu] = React.useState<string | null>(null);
  const [zoekenOpen, setZoekenOpen] = React.useState(false);
  const [mobielOpen, setMobielOpen] = React.useState(false);
  const sluitTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  React.useEffect(() => {
    const bijScroll = () => setGescrold(window.scrollY > 12);
    bijScroll();
    window.addEventListener("scroll", bijScroll, { passive: true });
    return () => window.removeEventListener("scroll", bijScroll);
  }, []);

  React.useEffect(() => {
    setOpenMenu(null);
    setMobielOpen(false);
    setZoekenOpen(false);
  }, [pathname]);

  /** Korte vertraging voorkomt dat het menu dichtklapt tijdens het schuin bewegen van de muis. */
  const plan = (waarde: string | null) => {
    if (sluitTimer.current) clearTimeout(sluitTimer.current);
    if (waarde === null) {
      sluitTimer.current = setTimeout(() => setOpenMenu(null), 140);
    } else {
      setOpenMenu(waarde);
    }
  };

  const zoek = (formulier: React.FormEvent<HTMLFormElement>) => {
    formulier.preventDefault();
    const veld = new FormData(formulier.currentTarget).get("q");
    const term = typeof veld === "string" ? veld.trim() : "";
    if (term) router.push(`/zoeken?q=${encodeURIComponent(term)}`);
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-500 ease-[var(--ease-uit)]",
        gescrold ? "glas border-b border-border/60 shadow-zacht" : "bg-transparent",
      )}
      onMouseLeave={() => plan(null)}
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
            {megamenus.map((menu) => (
              <div key={menu.label} onMouseEnter={() => plan(menu.label)}>
                <Link
                  href={menu.href}
                  className={cn(
                    "relative rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    openMenu === menu.label ? "text-salie-700" : "text-inkt hover:text-salie-700",
                  )}
                  aria-expanded={openMenu === menu.label}
                >
                  {menu.label}
                  <span
                    className={cn(
                      "absolute inset-x-4 -bottom-px h-px origin-left bg-salie-600 transition-transform duration-300 ease-[var(--ease-uit)]",
                      openMenu === menu.label ? "scale-x-100" : "scale-x-0",
                    )}
                  />
                </Link>
              </div>
            ))}
            {overigeLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onMouseEnter={() => plan(null)}
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
            <Button variant="ghost" size="icon-sm" asChild aria-label="Verlanglijst">
              <Link href="/verlanglijst">
                <Heart />
              </Link>
            </Button>
            <Button variant="ghost" size="icon-sm" asChild aria-label="Mijn account" className="hidden sm:inline-flex">
              <Link href="/account">
                <User />
              </Link>
            </Button>
            <Button variant="ghost" size="icon-sm" asChild aria-label="Winkelwagen">
              <Link href="/winkelwagen">
                <ShoppingBag />
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
            <form onSubmit={zoek} className="container-ukm flex items-center gap-3 py-4" role="search">
              <Search className="size-5 shrink-0 text-inkt-zacht" />
              <input
                autoFocus
                name="q"
                type="search"
                placeholder="Zoek op model, kleur of vorm - bijvoorbeeld cat eye of ash grey"
                aria-label="Zoek in het assortiment"
                className="h-10 w-full bg-transparent text-base outline-none placeholder:text-inkt-zacht/70"
              />
              <Button type="submit" size="sm">
                Zoeken
              </Button>
            </form>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Megamenu */}
      <AnimatePresence>
        {openMenu ? (
          <motion.div
            key={openMenu}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-x-0 top-full hidden border-t border-border/60 bg-creme/95 shadow-zwevend backdrop-blur-xl lg:block"
            onMouseEnter={() => plan(openMenu)}
            onMouseLeave={() => plan(null)}
          >
            <MegamenuPaneel label={openMenu} />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}

function MegamenuPaneel({ label }: { label: string }) {
  const menu = megamenus.find((m) => m.label === label);
  if (!menu) return null;

  return (
    <div className="container-ukm grid grid-cols-[repeat(3,minmax(0,1fr))_20rem] gap-10 py-10">
      {menu.kolommen.map((kolom) => (
        <div key={kolom.titel}>
          <p className="mb-4 font-display text-[0.6875rem] font-semibold tracking-[0.14em] text-inkt-zacht uppercase">
            {kolom.titel}
          </p>
          <ul className="space-y-2.5">
            {kolom.items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="group inline-flex items-center gap-1.5 text-sm text-inkt transition-colors hover:text-salie-700"
                >
                  {item.label}
                  <ChevronRight className="size-3.5 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}

      <Link
        href={menu.uitgelicht.href}
        className="group relative overflow-hidden rounded-2xl bg-creme-diep shadow-zacht"
      >
        <Image
          src={menu.uitgelicht.afbeelding}
          alt=""
          width={600}
          height={800}
          className="h-56 w-full object-cover object-top transition-transform duration-700 ease-[var(--ease-uit)] group-hover:scale-105"
        />
        <div className="absolute inset-0 overlay-onder" />
        <div className="absolute inset-x-0 bottom-0 p-5 text-white">
          <p className="text-[0.6875rem] font-semibold tracking-[0.14em] uppercase opacity-80">
            {menu.uitgelicht.label}
          </p>
          <p className="mt-1 font-display text-lg font-semibold">{menu.uitgelicht.titel}</p>
          <p className="mt-1 text-xs leading-relaxed text-white/85">{menu.uitgelicht.tekst}</p>
        </div>
      </Link>
    </div>
  );
}

function MobieleNavigatie() {
  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="border-b border-border px-6 py-6">
        <UkmLogo metTagline />
      </div>

      <nav className="flex-1 px-6 py-6" aria-label="Mobiele navigatie">
        {megamenus.map((menu) => (
          <div key={menu.label} className="mb-7">
            <SheetClose asChild>
              <Link href={menu.href} className="font-display text-xl font-semibold">
                {menu.label}
              </Link>
            </SheetClose>
            <ul className="mt-3 space-y-2.5 border-l border-border pl-4">
              {menu.kolommen[0].items.map((item) => (
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
        ))}

        <ul className="space-y-4 border-t border-border pt-6">
          {overigeLinks.map((link) => (
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
