import { Skeleton } from "@/components/ui/skeleton";

/**
 * Laadscherm tijdens routewissels. Het skelet volgt de indeling van de
 * homepagina, zodat de sprong naar de echte inhoud niet opvalt.
 */
export default function Laden() {
  return (
    <div className="container-ukm py-14 lg:py-24" aria-busy aria-live="polite">
      <span className="sr-only">Bezig met laden</span>

      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <Skeleton className="h-7 w-56 rounded-full" />
          <Skeleton className="mt-6 h-14 w-full" />
          <Skeleton className="mt-3 h-14 w-4/5" />
          <Skeleton className="mt-7 h-5 w-full" />
          <Skeleton className="mt-2.5 h-5 w-3/4" />
          <div className="mt-9 flex gap-3">
            <Skeleton className="h-13 w-48 rounded-full" />
            <Skeleton className="h-13 w-40 rounded-full" />
          </div>
        </div>
        <Skeleton className="aspect-[4/5] w-full rounded-3xl" />
      </div>

      <div className="mt-24 grid grid-cols-2 gap-x-5 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i}>
            <Skeleton className="aspect-[3/4] w-full rounded-2xl" />
            <Skeleton className="mt-4 h-3 w-24" />
            <Skeleton className="mt-3 h-4 w-3/4" />
            <Skeleton className="mt-2 h-3 w-full" />
            <Skeleton className="mt-3 h-5 w-28" />
          </div>
        ))}
      </div>
    </div>
  );
}
