import { OnthulGroep, OnthulKind } from "@/components/motion/onthul";
import { Productkaart } from "@/components/product/productkaart";
import { Sectiekop } from "@/components/home/sectiekop";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/product";

/**
 * Vaste opmaak voor elke productrij op de homepagina, zodat uitgelicht,
 * bestsellers en nieuwe aanvoer exact hetzelfde ritme houden.
 */
export function Productsectie({
  bovenschrift,
  titel,
  tekst,
  link,
  producten,
  aantalKolommen = 4,
  prioriteit = false,
  className,
}: {
  bovenschrift?: string;
  titel: string;
  tekst?: string;
  link?: { label: string; href: string };
  producten: Product[];
  aantalKolommen?: 3 | 4;
  prioriteit?: boolean;
  className?: string;
}) {
  if (producten.length === 0) return null;

  return (
    <section className={cn("container-ukm py-14 lg:py-20", className)}>
      <Sectiekop bovenschrift={bovenschrift} titel={titel} tekst={tekst} link={link} />

      <OnthulGroep
        className={cn(
          "grid grid-cols-2 gap-x-5 gap-y-10 sm:gap-x-6",
          aantalKolommen === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3",
        )}
      >
        {producten.map((product, i) => (
          <OnthulKind key={product.id}>
            <Productkaart product={product} prioriteit={prioriteit && i < 2} />
          </OnthulKind>
        ))}
      </OnthulGroep>
    </section>
  );
}
