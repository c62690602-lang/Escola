import { ImageResponse } from "next/og";
export const alt = "NEXO — Inteligência que conecta. Gestão que transforma.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function Image() {
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        background: "#122f3b",
        color: "#fff",
        padding: "75px 90px",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: 560,
          height: 560,
          borderRadius: 560,
          border: "1px solid #567c71",
          right: -100,
          top: -150,
          display: "flex",
        }}
      />
      <div
        style={{
          fontSize: 20,
          letterSpacing: 4,
          color: "#b5e8c6",
          display: "flex",
        }}
      >
        CERTTIFICA APRESENTA
      </div>
      <div
        style={{
          fontSize: 190,
          fontWeight: 700,
          letterSpacing: -12,
          display: "flex",
          marginTop: 25,
        }}
      >
        nexo
      </div>
      <div style={{ fontSize: 36, color: "#b5e8c6", display: "flex" }}>
        Inteligência que conecta.
      </div>
      <div
        style={{
          fontSize: 36,
          color: "#b5e8c6",
          display: "flex",
          marginTop: 8,
        }}
      >
        Gestão que transforma.
      </div>
    </div>,
    size,
  );
}
