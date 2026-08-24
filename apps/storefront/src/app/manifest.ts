import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Binks Machina",
    short_name: "Binks",
    description: "Hareket hâlindeki yaşam için özgün ürünler.",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f6f2",
    theme_color: "#111111",
    lang: "tr",
    icons: [
      {
        src: "/logo/binks-machina-logo.png",
        sizes: "any",
        type: "image/png",
      },
    ],
  };
}
