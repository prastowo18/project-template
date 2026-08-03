import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "38px",
        color: "#ffffff",
        background: "linear-gradient(135deg, #020617, #1e293b)",
        fontFamily: "sans-serif",
        fontSize: "100px",
        fontWeight: 800,
      }}
    >
      N
    </div>,
    size,
  );
}
