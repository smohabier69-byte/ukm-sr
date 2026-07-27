import type { Metadata } from "next";
import Link from "next/link";
import { FileText, Play } from "lucide-react";

import { Paginakop } from "@/components/catalogus/paginakop";
import { MediaKaart } from "@/components/media/media-kaart";
import { OnthulGroep, OnthulKind } from "@/components/motion/onthul";
import { gesorteerdeMedia } from "@/data/media";
import { cn } from "@/lib/utils";
import type { MediaSoort } from "@/types/media";

export const metadata: Metadata = {
  title: "Media",
  description: "Video's uit de winkel en artikelen van UKM.sr, op een plek.",
  alternates: { canonical: "/media" },
};

const tabs: { label: string; waarde: MediaSoort | "alles"; icoon?: typeof Play }[] = [
  { label: "Alles", waarde: "alles" },
  { label: "Video's", waarde: "video", icoon: Play },
  { label: "Artikelen", waarde: "artikel", icoon: FileText },
];

export default async function MediaPagina({
  searchParams,
}: {
  searchParams: Promise<{ soort?: string }>;
}) {
  const { soort } = await searchParams;
  const alles = gesorteerdeMedia();
  const items = soort === "video" || soort === "artikel" ? alles.filter((item) => item.soort === soort) : alles;

  return (
    <>
      <Paginakop
        kruimels={[{ label: "Home", href: "/" }, { label: "Media" }]}
        titel="Media"
        tekst="Beelden uit de winkel en achtergrondverhalen: hier komt alles samen wat geen productpagina is."
      />

      <section className="container-ukm py-10 lg:py-14">
        <nav aria-label="Filter op type" className="mb-10 flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const actief = (tab.waarde === "alles" && !soort) || tab.waarde === soort;
            return (
              <Link
                key={tab.waarde}
                href={tab.waarde === "alles" ? "/media" : `/media?soort=${tab.waarde}`}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                  actief
                    ? "border-salie-700 bg-salie-700 text-white"
                    : "border-border bg-white text-inkt hover:border-salie-400",
                )}
              >
                {tab.icoon ? <tab.icoon className="size-3.5" /> : null}
                {tab.label}
              </Link>
            );
          })}
        </nav>

        {items.length === 0 ? (
          <p className="py-20 text-center text-sm text-inkt-zacht">
            Nog niets in deze categorie. Kom later terug.
          </p>
        ) : (
          <OnthulGroep className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item, i) => (
              <OnthulKind key={item.slug}>
                <MediaKaart item={item} prioriteit={i < 2} />
              </OnthulKind>
            ))}
          </OnthulGroep>
        )}
      </section>
    </>
  );
}
