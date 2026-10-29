import { ImageResponse } from "next/og";

// Home-screen icon for iPhones, drawn to match icon.svg. Generated images can't read CSS
// variables: keep the colours in sync with --bottle-700, --cream-50 and --clay-500.
export const size = { width: 180, height: 180 };
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
        background: "#1e4a3b",
        color: "#fdfcf8",
        fontSize: 120,
        fontWeight: 900,
      }}
    >
      S
      <div
        style={{
          width: 22,
          height: 22,
          marginTop: 56,
          marginLeft: 4,
          borderRadius: 11,
          background: "#cf7442",
        }}
      />
    </div>,
    size,
  );
}
