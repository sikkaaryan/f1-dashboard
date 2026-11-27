import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "F1 Cockpit",
    short_name: "F1 Cockpit",
    description: "Technical motorsport dashboard for iPhone",
    start_url: "/",
    display: "standalone",
    orientation: "landscape",
    background_color: "#07090c",
    theme_color: "#07090c",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }]
  };
}
