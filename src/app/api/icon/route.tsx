import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const tamanho = Number(req.nextUrl.searchParams.get("size")) || 512;

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
        <svg
          width={tamanho * 0.65}
          height={tamanho * 0.65}
          viewBox="0 0 40 40"
        >
          <path
            d="M6 6H34V14L14 26H34V34H6V26L26 14H6V6Z"
            fill="#0E0F0C"
          />
        </svg>
      </div>
    ),
    { width: tamanho, height: tamanho }
  );
}
