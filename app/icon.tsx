import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/** Merkteken voor het tabblad, in de saliekleur van het logo. */
export default function Icoon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#a8b8a0",
          color: "#ffffff",
          fontSize: 17,
          fontWeight: 800,
          letterSpacing: -1,
          borderRadius: 7,
          fontFamily: "sans-serif",
        }}
      >
        U
      </div>
    ),
    size,
  );
}
