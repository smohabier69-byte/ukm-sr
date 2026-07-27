import Image from "next/image";
import Link from "next/link";
import { FileText, Play } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { formatDatumLang } from "@/lib/format";
import type { MediaItem } from "@/types/media";

export function MediaKaart({ item, prioriteit = false }: { item: MediaItem; prioriteit?: boolean }) {
  return (
    <Link href={`/media/${item.slug}`} className="group flex flex-col">
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-creme-diep">
        <Image
          src={item.omslag}
          alt={item.titel}
          fill
          priority={prioriteit}
          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
          className="object-cover object-top transition-transform duration-700 ease-[var(--ease-uit)] group-hover:scale-105"
        />
        <div className="absolute inset-0 overlay-onder" />

        <Badge variant="wit" size="sm" className="absolute top-3 left-3">
          {item.soort === "video" ? (
            <>
              <Play className="size-3" />
              Video
            </>
          ) : (
            <>
              <FileText className="size-3" />
              Artikel
            </>
          )}
        </Badge>

        {item.soort === "video" ? (
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-white/90 text-inkt shadow-zwevend transition-transform duration-300 ease-[var(--ease-uit)] group-hover:scale-110">
              <Play className="ml-0.5 size-5 fill-current" />
            </span>
          </span>
        ) : null}
      </div>

      <p className="mt-3.5 text-xs text-inkt-zacht">{formatDatumLang(item.gepubliceerdOp)}</p>
      <h3 className="mt-1 font-display text-base font-semibold text-inkt transition-colors group-hover:text-salie-700">
        {item.titel}
      </h3>
      <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-inkt-zacht">{item.samenvatting}</p>
    </Link>
  );
}
