import { Skeleton } from "@/components/ui/skeleton";

/** Skelet voor de beheerschermen: kerncijfers boven, panelen daaronder. */
export default function BeheerLaden() {
  return (
    <div className="space-y-6" aria-busy aria-live="polite">
      <span className="sr-only">Bezig met laden</span>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Skeleton className="h-96 rounded-2xl" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>

      <Skeleton className="h-80 rounded-2xl" />
    </div>
  );
}
