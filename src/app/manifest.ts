import type { MetadataRoute } from "next";

import { APPLICATION } from "@/config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: APPLICATION.name,
    short_name: APPLICATION.shortName,
    description: APPLICATION.description,

    start_url: "/",
    scope: "/",
    display: "standalone",

    background_color: APPLICATION.backgroundColor,
    theme_color: APPLICATION.themeColor,

    icons: [
      {
        src: "/app-icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
