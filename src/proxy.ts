import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { createRequestId } from "@/observability";

export function proxy(request: NextRequest) {
  const requestId = createRequestId(request.headers.get("x-request-id"));

  const requestHeaders = new Headers(request.headers);

  requestHeaders.set("x-request-id", requestId);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  response.headers.set("x-request-id", requestId);

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|app-icon.svg|apple-icon|opengraph-image|twitter-image|manifest.webmanifest|robots.txt|sitemap.xml).*)",
  ],
};
