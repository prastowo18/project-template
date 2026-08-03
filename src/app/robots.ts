import type { MetadataRoute } from "next";

import { env } from "@/env/server";

export default function robots(): MetadataRoute.Robots {
  if (!env.SITE_INDEXING_ENABLED) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  const applicationUrl = new URL(env.BETTER_AUTH_URL);

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/", "/forbidden", "/login", "/register"],
    },

    sitemap: new URL("/sitemap.xml", applicationUrl).toString(),

    host: applicationUrl.origin,
  };
}
