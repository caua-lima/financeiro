import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Financeiro",
    short_name: "Financeiro",
    description: "Controle financeiro pessoal",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0E0F0C",
    theme_color: "#0E0F0C",
    icons: [
      { src: "/api/icon?size=192", sizes: "192x192", type: "image/png" },
      { src: "/api/icon?size=512", sizes: "512x512", type: "image/png" },
      {
        src: "/api/icon?size=512",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
