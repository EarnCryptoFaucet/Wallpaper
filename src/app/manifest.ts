import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: "4K Wallpapers",
    description: siteConfig.description,
    start_url: "/",
    display: "standalone",
    background_color: "#05040a",
    theme_color: "#05040a",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
