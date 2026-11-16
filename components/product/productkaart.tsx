import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { VerlanglijstKnop } from "@/components/product/verlanglijst-knop";
import { formatKorting, formatPrijs } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/product";
import { fotoStijl } from "@/lib/fotofocus";

/**
 * Productkaart voor rasters en carrousels.
 *
 * Bewust een servercomponent: het wisselen van foto bij hover gebeurt met CSS,
 * zodat er geen JavaScript nodig is om een lijst met honderd artikelen te tonen.
 */
export function Productkaart({
  product,
  prioriteit = false,
  className,
}: {
  product: Product;
  prioriteit?: boolean;
  className?: string;
}) {
  const tweedeFoto = product.afbeeldingen[1];
  const uitverkocht = product.voorraad === 0;
  const korting = product.vanPrijs ? formatKorting(product.vanPrijs, product.prijs) : 0;
  const kleuren = product.varianten.length;
  const ondertitel =
    product.soort === "lens"
      ? product.sterktesoort === "met-sterkte"
        ? `Met sterkte · ${product.sterktebereik?.toLowerCase() ?? ""}`
        : "Zonder sterkte"
      : product.korteBeschrijving;

  return (
    <article className={cn("group relative flex flex-col", className)}>
      {/* Buiten de link, zodat aanklikken niet naar de productpagina navigeert. */}
      <VerlanglijstKnop
        slug={product.slug}
        naam={product.naam}
        className="absolute top-3 right-3 z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100 focus-visible:opacity-100 max-lg:opacity-100"
      />

      <Link href={`/producten/${product.slug}`} className="flex flex-1 flex-col">
        <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-creme-diep ring-1 ring-inkt/5 transition-shadow duration-500 group-hover:shadow-kaart">
          <Image
            src={product.afbeeldingen[0]}
            alt={product.naam}
            fill
            sizes="(min-width: 1280px) 22vw, (min-width: 768px) 33vw, 50vw"
            priority={prioriteit}
            style={fotoStijl(product.afbeeldingen[0])}
            className={cn(
              "object-cover transition-all duration-700 ease-[var(--ease-uit)]",
              tweedeFoto ? "group-hover:scale-[1.03] group-hover:opacity-0" : "group-hover:scale-[1.04]",
              uitverkocht && "opacity-60 grayscale",
            )}
          />
          {tweedeFoto ? (
            <Image
              src={tweedeFoto}
              alt=""
              fill
              sizes="(min-width: 1280px) 22vw, (min-width: 768px) 33vw, 50vw"
              style={fotoStijl(tweedeFoto)}
              className={cn(
                "scale-105 object-cover opacity-0 transition-all duration-700 ease-[var(--ease-uit)] group-hover:scale-100 group-hover:opacity-100",
                uitverkocht && "grayscale",
              )}
            />
          ) : null}

          <div className="pointer-events-none absolute top-3 left-3 flex flex-col items-start gap-1.5">
            {korting > 0 ? <Badge variant="korting" size="sm">-{korting}%</Badge> : null}
            {uitverkocht ? (
              <Badge variant="outline" size="sm" className="bg-white/90">
                Uitverkocht
              </Badge>
            ) : (
              <>
                {product.labels.includes("bestseller") ? (
                  <Badge variant="goud" size="sm">
                    Bestseller
                  </Badge>
                ) : null}
                {product.labels.includes("nieuw") ? (
                  <Badge variant="nieuw" size="sm">
                    Nieuw
                  </Badge>
                ) : null}
              </>
            )}
            {product.labels.includes("bijna-uitverkocht") && !uitverkocht ? (
              <Badge variant="wit" size="sm">
                Nog {product.voorraad} op voorraad
              </Badge>
            ) : null}
          </div>

          {product.techniek === "nachtzicht" ? (
            <span className="pointer-events-none absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[0.6875rem] font-medium text-inkt backdrop-blur-sm">
              <span aria-hidden className="size-2.5 rounded-full bg-[#f2c418] ring-1 ring-inkt/30" />
              Nachtzicht
            </span>
          ) : null}
          {product.techniek === "ptc" ? (
            <span className="pointer-events-none absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[0.6875rem] font-medium text-inkt backdrop-blur-sm">
              <span aria-hidden className="size-2.5 rounded-full bg-gradient-to-r from-white from-50% to-inkt to-50% ring-1 ring-inkt/40" />
              PTC
            </span>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col px-1 pt-4">
          {/* Op smalle kaarten (twee kolommen op mobiel) staat de prijs onder de naam. */}
          <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
            <h3 className="font-display text-base leading-snug font-semibold text-inkt transition-colors group-hover:text-salie-700 sm:text-[1.0625rem]">
              {product.naam}
            </h3>
            <span className="shrink-0 sm:pt-0.5 sm:text-right">
              <span className="block text-[0.9375rem] font-semibold whitespace-nowrap">{formatPrijs(product.prijs)}</span>
              {product.vanPrijs ? (
                <span className="block text-xs text-inkt-zacht line-through">{formatPrijs(product.vanPrijs)}</span>
              ) : null}
            </span>
          </div>

          <p className="mt-1 line-clamp-2 text-[0.8125rem] leading-relaxed text-inkt-zacht">{ondertitel}</p>

          {kleuren > 0 ? (
            <div className="mt-3 flex items-center gap-1.5">
              {product.varianten.slice(0, 5).map((variant) => (
                <span
                  key={variant.id}
                  title={variant.naam}
                  className={cn(
                    "size-4 rounded-full ring-1 ring-inkt/15 ring-offset-2 ring-offset-background",
                    variant.voorraad === 0 && "opacity-35",
                  )}
                  style={{ backgroundColor: variant.swatch }}
                />
              ))}
              <span className="ml-1 text-[0.6875rem] text-inkt-zacht">
                {kleuren} {kleuren === 1 ? "kleur" : "kleuren"}
              </span>
            </div>
          ) : null}
        </div>
      </Link>
    </article>
  );
}
