import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Sterren } from "@/components/product/sterren";
import { formatKorting, formatPrijs } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/product";

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

  return (
    <article className={cn("group relative flex flex-col", className)}>
      <Link href={`/producten/${product.slug}`} className="flex flex-1 flex-col">
        <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-creme-diep">
          <Image
            src={product.afbeeldingen[0]}
            alt={product.naam}
            fill
            sizes="(min-width: 1280px) 22vw, (min-width: 768px) 33vw, 50vw"
            priority={prioriteit}
            className={cn(
              "object-cover object-top transition-all duration-700 ease-[var(--ease-uit)]",
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
              className="scale-105 object-cover object-top opacity-0 transition-all duration-700 ease-[var(--ease-uit)] group-hover:scale-100 group-hover:opacity-100"
            />
          ) : null}

          <div className="pointer-events-none absolute top-3 left-3 flex flex-col items-start gap-1.5">
            {korting > 0 ? <Badge variant="korting" size="sm">-{korting}%</Badge> : null}
            {product.labels.includes("nieuw") ? (
              <Badge variant="nieuw" size="sm">
                Nieuw
              </Badge>
            ) : null}
            {product.techniek === "ptc" ? (
              <Badge variant="wit" size="sm">
                PTC
              </Badge>
            ) : null}
            {uitverkocht ? (
              <Badge variant="outline" size="sm" className="bg-white/90">
                Uitverkocht
              </Badge>
            ) : product.labels.includes("bijna-uitverkocht") ? (
              <Badge variant="wit" size="sm">
                Nog {product.voorraad} op voorraad
              </Badge>
            ) : null}
          </div>
        </div>

        <div className="flex flex-1 flex-col pt-4">
          <Sterren score={product.score} aantal={product.aantalBeoordelingen} compact />

          <h3 className="mt-2 font-display text-[0.9375rem] leading-snug font-semibold text-inkt">
            {product.naam}
          </h3>
          <p className="mt-1 line-clamp-2 text-[0.8125rem] leading-relaxed text-inkt-zacht">
            {product.korteBeschrijving}
          </p>

          <div className="mt-3 flex flex-wrap items-baseline gap-2">
            <span className="font-display text-base font-semibold">{formatPrijs(product.prijs)}</span>
            {product.vanPrijs ? (
              <span className="text-sm text-inkt-zacht line-through">{formatPrijs(product.vanPrijs)}</span>
            ) : null}
          </div>

          {product.varianten.length > 0 ? (
            <div className="mt-3 flex items-center gap-1.5">
              {product.varianten.slice(0, 5).map((variant) => (
                <span
                  key={variant.id}
                  title={variant.naam}
                  className="size-3.5 rounded-full ring-1 ring-inkt/10 ring-offset-1 ring-offset-background"
                  style={{ backgroundColor: variant.swatch }}
                />
              ))}
              {product.varianten.length > 5 ? (
                <span className="text-[0.6875rem] text-inkt-zacht">+{product.varianten.length - 5}</span>
              ) : null}
            </div>
          ) : null}
        </div>
      </Link>
    </article>
  );
}
