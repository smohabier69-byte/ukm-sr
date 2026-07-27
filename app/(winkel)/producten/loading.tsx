import { Skeleton } from "@/components/ui/skeleton";

/**
 * Laadscherm voor de overzichtspagina's. Bewust niet in de hoofdmap gezet: een
 * Suspense-grens rond de hele app laat het antwoord met statuscode 200
 * vertrekken, waardoor notFound() daarna geen echte 404 meer kan geven.
 */
export default function Laden() {
  return (
    <div aria-busy aria-live="polite">
      <span className="sr-only">Bezig met laden</span>

      <div className="border-b border-border/70 bg-salie-50/50">
        <div className="container-ukm py-8 lg:py-12">
          <Skeleton className="h-4 w-48" />
          <div className="mt-6 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl flex-1">
              <Skeleton className="h-10 w-72" />
              <Skeleton className="mt-4 h-4 w-full max-w-lg" />
              <Skeleton className="mt-2.5 h-4 w-40" />
            </div>
            <Skeleton className="h-44 w-full rounded-2xl lg:w-80" />
          </div>
        </div>
      </div>

      <div className="container-ukm grid gap-10 py-10 lg:grid-cols-[17rem_1fr] lg:gap-12 lg:py-14">
        <div className="hidden space-y-7 lg:block">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i}>
              <Skeleton className="h-4 w-28" />
              <div className="mt-4 space-y-2.5">
                {Array.from({ length: 4 }).map((__, j) => (
                  <Skeleton key={j} className="h-3.5 w-full" />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div>
          <div className="mb-6 flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 w-44 rounded-full" />
          </div>
          <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:gap-x-6 xl:grid-cols-3 2xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
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
      </div>
    </div>
  );
}
