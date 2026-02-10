import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "KorpoBingo",
    short_name: "KorpoBingo",
    description: "Corporate buzzword bingo for boring meetings",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#1a237e",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
