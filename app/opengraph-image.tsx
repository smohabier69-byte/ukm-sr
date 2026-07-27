import { ImageResponse } from "next/og";

import { bedrijf } from "@/lib/site";

export const alt = `${bedrijf.naam} - ${bedrijf.taglineVertaling}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Deelafbeelding voor WhatsApp, Facebook en Instagram.
 *
 * Wordt bij het bouwen gegenereerd in plaats van als bestand meegeleverd, zodat
 * merknaam en kleuren op een plek staan en niet uit de pas kunnen lopen met de
 * rest van de site. Juist in Suriname wordt een link vaak via WhatsApp gedeeld,
 * dus dit is voor veel bezoekers de eerste indruk.
 */
export default function OpenGraphAfbeelding() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#faf6f1",
          padding: 80,
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -180,
            right: -140,
            width: 620,
            height: 620,
            borderRadius: 9999,
            background: "#e8ede4",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 64,
              height: 64,
              borderRadius: 18,
              background: "#a8b8a0",
              color: "#ffffff",
              fontSize: 26,
              fontWeight: 800,
              letterSpacing: -1,
            }}
          >
            UKM
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 34, fontWeight: 800, color: "#100f0d", letterSpacing: -1 }}>UKM.Sr</div>
            <div style={{ fontSize: 17, color: "#4a4845", letterSpacing: 3 }}>
              {bedrijf.tagline.toUpperCase()}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 62,
              fontWeight: 800,
              color: "#100f0d",
              lineHeight: 1.05,
              letterSpacing: -3,
              maxWidth: 1000,
            }}
          >
            Bescherm je ogen.
          </div>
          <div
            style={{
              fontSize: 62,
              fontWeight: 800,
              color: "#5c6e54",
              lineHeight: 1.05,
              letterSpacing: -3,
              maxWidth: 1000,
            }}
          >
            Zonder in te leveren op stijl.
          </div>
        </div>

        {/* Satori eist een expliciete display op elke div met meer dan een kind,
            dus staat elke tekstregel hier als een enkele string. */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 24, color: "#4a4845" }}>
            {"Anti-blauwlicht brillen · PTC photochroom · Kleurlenzen"}
          </div>
          <div style={{ fontSize: 24, color: "#4a4845" }}>
            {`${bedrijf.adres.straat}, ${bedrijf.adres.stad}`}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
