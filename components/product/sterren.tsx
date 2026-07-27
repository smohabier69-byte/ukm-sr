import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

/** Waarderingssterren met halve stap; het cijfer blijft leesbaar voor schermlezers. */
export function Sterren({
  score,
  aantal,
  className,
  compact = false,
}: {
  score: number;
  aantal?: number;
  className?: string;
  compact?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className="flex" aria-hidden>
        {[0, 1, 2, 3, 4].map((i) => {
          const vulling = Math.max(0, Math.min(1, score - i));
          return (
            <span key={i} className="relative">
              <Star className={cn("text-salie-200", compact ? "size-3" : "size-3.5")} fill="currentColor" />
              <span className="absolute inset-0 overflow-hidden" style={{ width: `${vulling * 100}%` }}>
                <Star className={cn("text-goud", compact ? "size-3" : "size-3.5")} fill="currentColor" />
              </span>
            </span>
          );
        })}
      </div>
      <span className={cn("text-inkt-zacht", compact ? "text-[0.6875rem]" : "text-xs")}>
        {score.toFixed(1).replace(".", ",")}
        {aantal !== undefined ? ` (${aantal})` : ""}
      </span>
      <span className="sr-only">
        Beoordeeld met {score.toFixed(1).replace(".", ",")} van de 5 sterren
        {aantal !== undefined ? `, gebaseerd op ${aantal} beoordelingen` : ""}.
      </span>
    </div>
  );
}
