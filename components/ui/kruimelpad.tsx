import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { siteUrl } from "@/lib/site";

export interface Kruimel {
  label: string;
  href?: string;
}

/** Kruimelpad met bijpassende gestructureerde gegevens voor zoekmachines. */
export function Kruimelpad({ kruimels, className }: { kruimels: Kruimel[]; className?: string }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    // Google eist absolute URL's in "item"; een relatief pad wordt genegeerd.
    itemListElement: kruimels.map((kruimel, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: kruimel.label,
      ...(kruimel.href ? { item: `${siteUrl}${kruimel.href}` } : {}),
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <nav aria-label="Kruimelpad" className={cn("flex items-center gap-1.5 text-sm text-inkt-zacht", className)}>
        {kruimels.map((kruimel, i) => (
          <span key={`${kruimel.label}-${i}`} className="flex items-center gap-1.5">
            {i > 0 ? <ChevronRight className="size-3.5 opacity-50" /> : null}
            {kruimel.href ? (
              <Link href={kruimel.href} className="transition-colors hover:text-salie-700">
                {kruimel.label}
              </Link>
            ) : (
              <span className="text-inkt" aria-current="page">
                {kruimel.label}
              </span>
            )}
          </span>
        ))}
      </nav>
    </>
  );
}
