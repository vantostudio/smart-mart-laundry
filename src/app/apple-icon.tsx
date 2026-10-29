import { ImageResponse } from "next/og";

import { LOGO_PATHS } from "@/components/shared/logo-mark";

// Home-screen icon for iPhones, and the logo in the site's structured data. Generated images
// can't read CSS variables: keep the colours in sync with --bottle-700 and --cream-50.
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
      }}
    >
      <svg
        width="140"
        height="140"
        viewBox="0 0 64 64"
        fill="none"
        stroke="#fdfcf8"
        strokeWidth={5}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={LOGO_PATHS.hook} />
        <path d={LOGO_PATHS.hanger} />
      </svg>
    </div>,
    size,
  );
}
