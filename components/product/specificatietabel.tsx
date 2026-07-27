import type { Specificatie } from "@/types/product";

export function Specificatietabel({ specificaties }: { specificaties: Specificatie[] }) {
  return (
    <dl className="divide-y divide-border overflow-hidden rounded-2xl border border-border/70 bg-white">
      {specificaties.map((rij) => (
        <div key={rij.label} className="grid grid-cols-2 gap-4 px-5 py-3.5 text-sm sm:grid-cols-[14rem_1fr]">
          <dt className="text-inkt-zacht">{rij.label}</dt>
          <dd className="font-medium">{rij.waarde}</dd>
        </div>
      ))}
    </dl>
  );
}
