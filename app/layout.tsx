import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";

import { BewegingProvider } from "@/components/motion/beweging-provider";
import { Meldingen } from "@/components/layout/meldingen";
import { bedrijf, siteUrl } from "@/lib/site";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${bedrijf.naam} | Anti-blauwlicht brillen en kleurlenzen in Paramaribo`,
    template: `%s | ${bedrijf.naam}`,
  },
  description: bedrijf.beschrijving,
  applicationName: bedrijf.naam,
  keywords: [
    "anti-blauwlicht bril",
    "blue light glasses Suriname",
    "photochrome bril",
    "PTC bril",
    "kleurlenzen Paramaribo",
    "lenzen met sterkte",
    "brillen Suriname",
    "UKM.sr",
  ],
  authors: [{ name: bedrijf.naam }],
  creator: bedrijf.naam,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "nl_SR",
    url: siteUrl,
    siteName: bedrijf.naam,
    title: `${bedrijf.naam} | ${bedrijf.taglineVertaling}`,
    description: bedrijf.beschrijving,
  },
  twitter: {
    card: "summary_large_image",
    title: `${bedrijf.naam} | ${bedrijf.taglineVertaling}`,
    description: bedrijf.beschrijving,
  },
  robots: { index: true, follow: true },
  // De deelafbeelding en het tabbladicoon komen uit opengraph-image.tsx en icon.tsx.
};

export const viewport: Viewport = {
  themeColor: "#faf6f1",
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl-SR" className={`${inter.variable} ${jakarta.variable}`}>
      <head>
        {/*
          Framer Motion zet de beginwaarde van elke onthulling als inline stijl
          in de HTML. Draait er geen JavaScript, dan blijft die stijl staan en
          is de pagina leeg. Deze regel maakt alles in dat geval direct zichtbaar.
        */}
        <noscript>
          <style>{`[data-onthul]{opacity:1 !important;transform:none !important}`}</style>
        </noscript>
      </head>
      <body className="min-h-dvh antialiased">
        <a
          href="#hoofdinhoud"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-100 focus:rounded-full focus:bg-inkt focus:px-5 focus:py-3 focus:text-sm focus:text-creme"
        >
          Naar de hoofdinhoud
        </a>

        {/*
          De winkel en het beheerpaneel hebben elk hun eigen omlijsting, dus die
          staan in aparte routegroepen. Hier blijft alleen wat overal geldt.
        */}
        <BewegingProvider>
          {children}
          <Meldingen />
        </BewegingProvider>
      </body>
    </html>
  );
}
