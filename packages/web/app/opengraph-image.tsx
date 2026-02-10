import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "KorpoBingo - Corporate buzzword bingo for boring meetings";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #1a237e 0%, #0d1442 100%)",
        fontFamily: "sans-serif",
      }}
    >
      {/* Grid pattern overlay */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          opacity: 0.08,
          backgroundImage:
            "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      {/* Gold accent bar */}
      <div
        style={{
          position: "absolute",
          top: 260,
          left: 100,
          right: 100,
          height: 80,
          borderRadius: 12,
          background: "#ffd700",
          opacity: 0.9,
          display: "flex",
        }}
      />
      {/* App name */}
      <div
        style={{
          fontSize: 96,
          fontWeight: 900,
          color: "white",
          letterSpacing: "-2px",
          display: "flex",
          zIndex: 1,
        }}
      >
        KorpoBingo
      </div>
      {/* Tagline */}
      <div
        style={{
          fontSize: 32,
          color: "rgba(255, 255, 255, 0.7)",
          marginTop: 24,
          display: "flex",
          zIndex: 1,
        }}
      >
        Corporate buzzword bingo for boring meetings
      </div>
    </div>,
    { ...size },
  );
}
