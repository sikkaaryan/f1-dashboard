import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "F1 Dashboard",
    short_name: "F1 Dashboard",
    description: "Personal F1-inspired dashboard",
    start_url: "/",
    display: "standalone",
    orientation: "landscape",
    background_color: "#08090b",
    theme_color: "#08090b",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml"
      }
    ]
  };
}
