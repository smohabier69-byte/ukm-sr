import { Skeleton } from "@/components/ui/skeleton";

/** Skelet van de productpagina, met dezelfde indeling als de echte pagina. */
export default function ProductLaden() {
  return (
    <div className="container-ukm py-10 lg:py-14" aria-busy aria-live="polite">
      <span className="sr-only">Bezig met laden</span>

      <Skeleton className="h-4 w-64" />

      <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col-reverse gap-4 lg:flex-row">
          <div className="flex gap-3 lg:w-20 lg:shrink-0 lg:flex-col">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square w-16 rounded-xl lg:w-full" />
            ))}
          </div>
          <Skeleton className="aspect-[3/4] flex-1 rounded-3xl" />
        </div>

        <div>
          <Skeleton className="h-4 w-28" />
          <Skeleton className="mt-3 h-10 w-3/4" />
          <Skeleton className="mt-3 h-4 w-52" />
          <Skeleton className="mt-6 h-4 w-40" />
          <Skeleton className="mt-8 h-9 w-44" />
          <div className="mt-8 flex gap-3">
            <Skeleton className="h-13 w-36 rounded-full" />
            <Skeleton className="h-13 flex-1 rounded-full" />
          </div>
          <div className="mt-8 grid gap-2.5 sm:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
