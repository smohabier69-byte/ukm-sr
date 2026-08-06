import type { Metadata } from "next";

import { Hero } from "@/components/home/hero";
import { Voordelen } from "@/components/home/voordelen";
import { Promotie } from "@/components/home/promotie";
import { CategorieenSectie } from "@/components/home/categorieen-sectie";
import { PtcDemo } from "@/components/home/ptc-demo";
import { Productsectie } from "@/components/home/productsectie";
import { VeelgesteldeVragenPreview } from "@/components/home/veelgestelde-vragen-preview";
import { Nieuwsbrief } from "@/components/home/nieuwsbrief";
import { RecentBekeken } from "@/components/product/recent-bekeken";
import { nieuwBinnen, uitgelicht } from "@/lib/square/producten";
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
 * hier iets dat een andere pagina niet ook al doet: bladeren, filteren en het
 * volledige merkenoverzicht horen bij /producten, /categorie en /merken -
 * bereikbaar via het megamenu, niet nogmaals hier.
 *
 * "Uitgelicht" is al populariteit-gesorteerd (met spreiding over vorm en
 * techniek), dus een aparte bestsellerssectie zou grotendeels hetzelfde
 * tonen. "Nieuw binnen" is wel een ander signaal (recentheid) en krijgt
 * daarom een eigen rij; een derde bijna-identieke productrij zou de
 * rommeligheid terugbrengen die deze pagina bewust heeft opgelost.
 */
export default async function Homepagina() {
  const [uitgelichtProducten, nieuwBinnenProducten] = await Promise.all([uitgelicht(), nieuwBinnen()]);

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
        producten={uitgelichtProducten}
        prioriteit
      />

      <Promotie />

      <Productsectie
        bovenschrift="Nieuw binnen"
        titel="Net toegevoegd aan het assortiment"
        tekst="De laatste aanvullingen op het assortiment, nog vers in de winkel."
        link={{ label: "Bekijk alle nieuwe modellen", href: "/producten?sorteer=nieuwste" }}
        producten={nieuwBinnenProducten}
        aantalKolommen={4}
      />

      <VeelgesteldeVragenPreview />
      <RecentBekeken />
      <Nieuwsbrief />
    </>
  );
}
