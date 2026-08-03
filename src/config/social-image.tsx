import { ImageResponse } from "next/og";

import { APPLICATION } from "./application";

export const SOCIAL_IMAGE_SIZE = {
  width: 1200,
  height: 630,
} as const;

export function createApplicationSocialImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "72px",
        color: "#ffffff",
        background: "linear-gradient(135deg, #020617 0%, #0f172a 55%, #1e293b 100%)",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "24px",
        }}
      >
        <div
          style={{
            width: "88px",
            height: "88px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "22px",
            background: "#ffffff",
            color: "#0f172a",
            fontSize: "46px",
            fontWeight: 800,
          }}
        >
          N
        </div>

        <div
          style={{
            fontSize: "30px",
            opacity: 0.82,
          }}
        >
          Production-ready foundation
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "24px",
        }}
      >
        <div
          style={{
            maxWidth: "980px",
            fontSize: "70px",
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: "-2px",
          }}
        >
          {APPLICATION.name}
        </div>

        <div
          style={{
            maxWidth: "1000px",
            fontSize: "30px",
            lineHeight: 1.4,
            opacity: 0.82,
          }}
        >
          {APPLICATION.description}
        </div>
      </div>
    </div>,
    SOCIAL_IMAGE_SIZE,
  );
}
