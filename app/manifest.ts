import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "You've Been Served | Bohn & Associates",
    short_name: "You've Been Served",
    description:
      "Process serving tracking system for Bohn & Associates field and admin teams.",
    start_url: "/",
    display: "standalone",
    background_color: "#f9fafb",
    theme_color: "#2563eb",
    icons: [
      {
        src: "/Logo.jpg",
        sizes: "512x512",
        type: "image/jpeg",
      },
    ],
  };
}