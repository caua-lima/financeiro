import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#F6C445",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="118" height="118" viewBox="0 0 40 40">
          <path
            d="M6 6H34V14L14 26H34V34H6V26L26 14H6V6Z"
            fill="#0E0F0C"
          />
        </svg>
      </div>
    ),
    { ...size }
  );
}
