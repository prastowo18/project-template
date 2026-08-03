import type { MetadataRoute } from "next";

import { env } from "@/env/server";

export default function sitemap(): MetadataRoute.Sitemap {
  if (!env.SITE_INDEXING_ENABLED) {
    return [];
  }

  return [
    {
      url: new URL("/", env.BETTER_AUTH_URL).toString(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
