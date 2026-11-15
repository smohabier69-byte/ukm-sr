import type { Metadata } from "next";

import { Hero } from "@/components/home/hero";
import { CategorieenSectie } from "@/components/home/categorieen-sectie";
import { Cadeauwijzer } from "@/components/home/cadeauwijzer";
import { PtcDemo } from "@/components/home/ptc-demo";
import { Lenskleuren } from "@/components/home/lenskleuren";
import { DuoBanner } from "@/components/home/duo-banner";
import { ZoBestelJe } from "@/components/home/zo-bestel-je";
import { Productsectie } from "@/components/home/productsectie";
import { VeelgesteldeVragenPreview } from "@/components/home/veelgestelde-vragen-preview";
import { Nieuwsbrief } from "@/components/home/nieuwsbrief";
import { RecentBekeken } from "@/components/product/recent-bekeken";
import { nieuwBinnen, uitgelicht } from "@/lib/square/producten";
import { bedrijf, siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: `${bedrijf.naam} | Brillen, leesbrillen en kleurlenzen in Paramaribo`,
  description: bedrijf.beschrijving,
  alternates: { canonical: "/" },
};

/**
 * Gestructureerde gegevens voor de winkel, zodat zoekmachines de vestiging
 * herkennen. "Optician" (naast "Store") is het meest specifieke schema.org-type
 * voor een opticien - LocalBusiness > MedicalBusiness > Optician - en geeft
 * zoekmachines een sterker signaal dan het generieke "Store" alleen.
 */
const winkelSchema = {
  "@context": "https://schema.org",
  "@type": ["Optician", "Store"],
  name: bedrijf.naam,
  description: bedrijf.beschrijving,
  url: siteUrl,
  image: `${siteUrl}/opengraph-image`,
  telephone: bedrijf.telefoon,
  email: bedrijf.email,
  address: {
    "@type": "PostalAddress",
    streetAddress: bedrijf.adres.straat,
    addressLocality: bedrijf.adres.stad,
    addressCountry: "SR",
  },
  geo: { "@type": "GeoCoordinates", latitude: bedrijf.adres.lat, longitude: bedrijf.adres.lng },
  areaServed: bedrijf.adres.stad,
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

/** Sitelinks-zoekvak in Google: laat zoekmachines direct naar /zoeken linken. */
const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: bedrijf.naam,
  url: siteUrl,
  potentialAction: {
    "@type": "SearchAction",
    target: { "@type": "EntryPoint", urlTemplate: `${siteUrl}/zoeken?q={search_term_string}` },
    "query-input": "required name=search_term_string",
  },
};

/**
 * De homepage is de etalage van een cadeauboetiek, geen catalogus. De
 * volgorde volgt hoe iemand een winkel binnenloopt: eerst de sfeer (hero),
 * dan de schappen (collecties), dan hulp bij kiezen (cadeauwijzer) en pas
 * daarna de producten zelf. Bladeren en filteren horen bij /producten en
 * /categorie.
 *
 * Er staan bewust maar twee productrijen: "Nieuw binnen" (recentheid) en
 * "Favorieten" (populariteit, gespreid over vorm en techniek). De lenzen
 * hebben hun eigen blok, ingedeeld op kleur.
 */
export default async function Homepagina() {
  // Beide productrijen tonen brillen; de lenzen hebben hun eigen blok (Lenskleuren).
  const nieuwBinnenProducten = await nieuwBinnen("bril");
  const uitgelichtProducten = await uitgelicht(
    nieuwBinnenProducten.map((p) => p.naam),
    "bril",
  );

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(winkelSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />

      <Hero />
      <CategorieenSectie />
      <Cadeauwijzer />

      <Productsectie
        bovenschrift="Nieuw binnen"
        titel={
          <>
            Net <em>uitgepakt</em>
          </>
        }
        tekst="De nieuwste monturen uit de collectie van november 2026."
        link={{ label: "Alle nieuwe modellen", href: "/producten?sorteer=nieuwste" }}
        producten={nieuwBinnenProducten}
        prioriteit
      />

      <PtcDemo />

      <Productsectie
        bovenschrift="Favorieten"
        titel={
          <>
            Geliefd in <em>de winkel</em>
          </>
        }
        tekst="Uit elke brillencollectie het model waar het vaakst naar gevraagd wordt."
        link={{ label: "Bekijk het volledige assortiment", href: "/producten" }}
        producten={uitgelichtProducten}
      />

      <Lenskleuren />
      <DuoBanner />
      <ZoBestelJe />
      <VeelgesteldeVragenPreview />
      <RecentBekeken />
      <Nieuwsbrief />
    </>
  );
}
