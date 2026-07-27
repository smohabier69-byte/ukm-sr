import type { Metadata } from "next";

import { Hero } from "@/components/home/hero";
import { Voordelen } from "@/components/home/voordelen";
import { Promotie } from "@/components/home/promotie";
import { CategorieenSectie } from "@/components/home/categorieen-sectie";
import { PtcDemo } from "@/components/home/ptc-demo";
import { Productsectie } from "@/components/home/productsectie";
import { Nieuwsbrief } from "@/components/home/nieuwsbrief";
import { RecentBekeken } from "@/components/product/recent-bekeken";
import { uitgelicht } from "@/data/producten";
import { bedrijf } from "@/lib/site";

export const metadata: Metadata = {
  title: `${bedrijf.naam} | Anti-blauwlicht brillen en kleurlenzen in Paramaribo`,
  description: bedrijf.beschrijving,
  alternates: { canonical: "/" },
};

/** Gestructureerde gegevens voor de winkel, zodat zoekmachines de vestiging herkennen. */
const winkelSchema = {
  "@context": "https://schema.org",
  "@type": "Store",
  name: bedrijf.naam,
  description: bedrijf.beschrijving,
  telephone: bedrijf.telefoon,
  address: {
    "@type": "PostalAddress",
    streetAddress: bedrijf.adres.straat,
    addressLocality: bedrijf.adres.stad,
    addressCountry: "SR",
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "10:00",
      closes: "18:00",
    },
    { "@type": "OpeningHoursSpecification", dayOfWeek: "Saturday", opens: "09:00", closes: "15:00" },
  ],
  sameAs: [bedrijf.instagramUrl, bedrijf.facebookUrl],
};

/**
 * De homepage is bewust een landingspagina, geen catalogus. Elke sectie doet
 * hier iets dat een andere pagina niet ook al doet: brillen en lenzen
 * bladeren, sorteren op nieuw of populair, en het volledige merkenoverzicht
 * horen bij /producten, /categorie en /merken - bereikbaar via het
 * "Categorieen"-menu, niet nogmaals hier.
 */
export default function Homepagina() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(winkelSchema) }} />

      <Hero />
      <Voordelen />
      <CategorieenSectie />
      <PtcDemo />

      <Productsectie
        bovenschrift="Uitgelicht"
        titel="Een doorsnede van de collectie"
        tekst="Uit elke vorm en techniek het model dat op dit moment het best loopt."
        link={{ label: "Bekijk het volledige assortiment", href: "/producten" }}
        producten={uitgelicht}
        prioriteit
      />

      <Promotie />
      <RecentBekeken />
      <Nieuwsbrief />
    </>
  );
}
