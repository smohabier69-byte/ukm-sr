"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, SearchX, SlidersHorizontal, X } from "lucide-react";

import { Productkaart } from "@/components/product/productkaart";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ActieveFilters } from "./actieve-filters";
import { Filterpaneel } from "./filterpaneel";
import {
  aantalActieveFilters,
  bouwFacetten,
  filterProducten,
  legeFilterstaat,
  naarZoekparameters,
  sorteeropties,
  type Filterstaat,
  type Sorteersleutel,
} from "@/lib/catalogus";
import type { Product } from "@/types/product";

const PAGINAGROOTTE = 24;

/**
 * Bladeren, filteren en sorteren binnen een vaste set producten.
 *
 * Het hele assortiment past ruim in het geheugen, dus filteren gebeurt in de
 * browser: het resultaat verschijnt zonder netwerkverzoek. De URL wordt wel
 * bijgewerkt - met history.replaceState in plaats van een navigatie, zodat een
 * selectie deelbaar is zonder dat elke aanvinkbeweging de pagina herlaadt.
 */
export function ProductBrowser({
  producten,
  beginstaat,
  metZoekveld = false,
}: {
  producten: Product[];
  beginstaat: Filterstaat;
  /** Toont een zoekveld boven de resultaten; gebruikt op de zoekpagina. */
  metZoekveld?: boolean;
}) {
  const facetten = React.useMemo(() => bouwFacetten(producten), [producten]);
  const [staat, setStaat] = React.useState<Filterstaat>(beginstaat);
  const [zichtbaar, setZichtbaar] = React.useState(PAGINAGROOTTE);
  const [filtersOpen, setFiltersOpen] = React.useState(false);

  const resultaten = React.useMemo(() => filterProducten(producten, staat), [producten, staat]);
  const actief = aantalActieveFilters(staat, facetten);

  const zet = React.useCallback((wijziging: Partial<Filterstaat>) => {
    setStaat((vorige) => ({ ...vorige, ...wijziging }));
    setZichtbaar(PAGINAGROOTTE);
  }, []);

  const wisAlles = React.useCallback(() => {
    setStaat((vorige) => ({
      ...legeFilterstaat(facetten.minPrijs, facetten.maxPrijs),
      zoekterm: vorige.zoekterm,
      sorteer: vorige.sorteer,
    }));
    setZichtbaar(PAGINAGROOTTE);
  }, [facetten.minPrijs, facetten.maxPrijs]);

  React.useEffect(() => {
    const params = naarZoekparameters(staat, facetten).toString();
    const url = params ? `${window.location.pathname}?${params}` : window.location.pathname;
    window.history.replaceState(null, "", url);
  }, [staat, facetten]);

  const getoond = resultaten.slice(0, zichtbaar);

  return (
    <div className="grid gap-10 lg:grid-cols-[17rem_1fr] lg:gap-12">
      <aside className="hidden lg:block">
        <div className="sticky top-24">
          <p className="mb-2 font-display text-sm font-semibold">Filters</p>
          <Filterpaneel staat={staat} facetten={facetten} zet={zet} />
        </div>
      </aside>

      <div className="min-w-0">
        {metZoekveld ? (
          <div className="relative mb-6">
            <Search className="pointer-events-none absolute top-1/2 left-5 size-4 -translate-y-1/2 text-inkt-zacht" />
            <input
              type="search"
              value={staat.zoekterm}
              onChange={(e) => zet({ zoekterm: e.target.value })}
              placeholder="Zoek op model, kleur of vorm"
              aria-label="Zoek in het assortiment"
              className="h-13 w-full rounded-full border border-input bg-white pr-12 pl-12 text-base transition-colors placeholder:text-inkt-zacht/70 focus:border-salie-400 focus:ring-2 focus:ring-salie-300/40 focus:outline-none"
            />
            {staat.zoekterm ? (
              <button
                type="button"
                onClick={() => zet({ zoekterm: "" })}
                aria-label="Zoekterm wissen"
                className="absolute top-1/2 right-4 -translate-y-1/2 rounded-full p-1.5 text-inkt-zacht transition-colors hover:bg-salie-100 hover:text-inkt"
              >
                <X className="size-4" />
              </button>
            ) : null}
          </div>
        ) : null}

        <div className="mb-6 flex items-center justify-between gap-4">
          <p className="text-sm text-inkt-zacht" aria-live="polite">
            <span className="font-medium text-inkt">{resultaten.length}</span>{" "}
            {resultaten.length === 1 ? "artikel" : "artikelen"}
          </p>

          <div className="flex items-center gap-2">
            <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="lg:hidden">
                  <SlidersHorizontal />
                  Filters
                  {actief > 0 ? (
                    <Badge variant="default" size="sm" className="ml-0.5">
                      {actief}
                    </Badge>
                  ) : null}
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" title="Filters" className="max-h-[85dvh] p-0">
                <div className="flex items-center justify-between border-b border-border px-6 py-5">
                  <p className="font-display text-lg font-semibold">Filters</p>
                  <p className="text-sm text-inkt-zacht">{resultaten.length} artikelen</p>
                </div>
                <div className="flex-1 overflow-y-auto px-6">
                  <Filterpaneel staat={staat} facetten={facetten} zet={zet} />
                </div>
                <div className="flex gap-3 border-t border-border px-6 py-4">
                  <Button variant="outline" className="flex-1" onClick={wisAlles} disabled={actief === 0}>
                    Wissen
                  </Button>
                  <Button className="flex-1" onClick={() => setFiltersOpen(false)}>
                    Toon {resultaten.length} artikelen
                  </Button>
                </div>
              </SheetContent>
            </Sheet>

            <Select
              value={staat.sorteer}
              onValueChange={(waarde) => zet({ sorteer: waarde as Sorteersleutel })}
            >
              <SelectTrigger className="h-9 min-w-44 text-sm" aria-label="Sorteren op">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sorteeropties.map((optie) => (
                  <SelectItem key={optie.waarde} value={optie.waarde}>
                    {optie.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <ActieveFilters staat={staat} facetten={facetten} zet={zet} wisAlles={wisAlles} />

        <AnimatePresence mode="wait">
          {resultaten.length === 0 ? (
            <motion.div
              key="leeg"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center rounded-3xl border border-dashed border-border bg-white/60 px-6 py-20 text-center"
            >
              <span className="flex size-14 items-center justify-center rounded-full bg-salie-100 text-salie-700">
                <SearchX className="size-6" />
              </span>
              <h2 className="mt-6 font-display text-xl font-semibold">
                {staat.zoekterm ? `Niets gevonden voor "${staat.zoekterm}"` : "Geen artikelen gevonden"}
              </h2>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-inkt-zacht">
                {staat.zoekterm
                  ? "Probeer een kortere zoekterm, een kleur zoals bruin of grijs, of een vorm zoals cat eye of browline."
                  : "Er zijn geen producten die aan deze combinatie van filters voldoen. Probeer een filter los te laten of het prijsbereik te verruimen."}
              </p>
              <div className="mt-7 flex flex-wrap justify-center gap-3">
                {staat.zoekterm ? (
                  <Button variant="outline" onClick={() => zet({ zoekterm: "" })}>
                    Zoekterm wissen
                  </Button>
                ) : null}
                {actief > 0 ? (
                  <Button variant="outline" onClick={wisAlles}>
                    Filters wissen
                  </Button>
                ) : null}
              </div>
            </motion.div>
          ) : (
            <motion.div key="raster" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
              <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:gap-x-6 xl:grid-cols-3 2xl:grid-cols-4">
                {getoond.map((product, i) => (
                  <Productkaart key={product.id} product={product} prioriteit={i < 4} />
                ))}
              </div>

              {zichtbaar < resultaten.length ? (
                <div className="mt-14 flex flex-col items-center gap-4">
                  <p className="text-sm text-inkt-zacht">
                    {getoond.length} van {resultaten.length} getoond
                  </p>
                  <Button variant="outline" size="lg" onClick={() => setZichtbaar((v) => v + PAGINAGROOTTE)}>
                    Toon meer artikelen
                  </Button>
                </div>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
