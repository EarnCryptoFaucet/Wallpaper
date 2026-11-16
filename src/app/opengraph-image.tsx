import { ImageResponse } from "next/og";

export const alt = "4K Wallpaper Of Me – OFFICIAL";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 90,
          background: "radial-gradient(circle at 80% 20%, #4c1d95 0%, #0a0618 55%, #05040a 100%)",
          color: "white",
        }}
      >
        <div style={{ fontSize: 30, letterSpacing: 10, color: "#c4b5fd", display: "flex" }}>OFFICIAL</div>
        <div style={{ fontSize: 112, fontWeight: 800, marginTop: 20, display: "flex" }}>4K Wallpaper Of Me</div>
        <div style={{ fontSize: 38, color: "#a1a1aa", marginTop: 24, display: "flex" }}>Premium original-resolution phone wallpapers</div>
      </div>
    ),
    size,
  );
}
