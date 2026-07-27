import type { Metadata } from "next";

import { Hero } from "@/components/home/hero";
import { Voordelen } from "@/components/home/voordelen";
import { Promotie } from "@/components/home/promotie";
import { CategorieenSectie } from "@/components/home/categorieen-sectie";
import { PtcDemo } from "@/components/home/ptc-demo";
import { MerkenSectie } from "@/components/home/merken-sectie";
import { Productsectie } from "@/components/home/productsectie";
import { Nieuwsbrief } from "@/components/home/nieuwsbrief";
import { RecentBekeken } from "@/components/product/recent-bekeken";
import { aanbevolen, bestsellers, nieuweAanvoer, uitgelicht } from "@/data/producten";
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

export default function Homepagina() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(winkelSchema) }} />

      <Hero />
      <Voordelen />

      <Productsectie
        bovenschrift="Uitgelicht"
        titel="Een doorsnede van de collectie"
        tekst="Uit elke vorm en techniek het model dat op dit moment het best loopt."
        link={{ label: "Bekijk alles", href: "/producten" }}
        producten={uitgelicht}
        prioriteit
      />

      <CategorieenSectie />
      <PtcDemo />
      <Promotie />

      <Productsectie
        bovenschrift="Meest verkocht"
        titel="Bestsellers"
        tekst="De modellen die het vaakst over de toonbank gaan aan de Rembrandtstraat."
        link={{ label: "Alle bestsellers", href: "/producten?sorteer=populariteit" }}
        producten={bestsellers}
      />

      <MerkenSectie />

      <Productsectie
        bovenschrift="Nieuw binnen"
        titel="Net toegevoegd aan het assortiment"
        tekst="De laatste aanvullingen op de collectie, uit beide prijslijsten."
        link={{ label: "Alle nieuwe modellen", href: "/producten?sorteer=nieuwste" }}
        producten={nieuweAanvoer}
      />

      <RecentBekeken />

      <Productsectie
        bovenschrift="Aanbevolen"
        titel="Het hoogst beoordeeld"
        tekst="Op basis van de waarderingen die klanten aan deze modellen gaven."
        producten={aanbevolen.slice(0, 4)}
      />

      <Nieuwsbrief />
    </>
  );
}
