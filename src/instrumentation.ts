import type { Instrumentation } from "next";

import { getRequestIdFromHeaders, logger, serializeError } from "@/observability";

export function register() {
  logger.info("server.initialized", {
    runtime: process.env.NEXT_RUNTIME ?? "unknown",
  });
}

export const onRequestError: Instrumentation.onRequestError = (error, request, context) => {
  logger.error("request.unhandled_error", {
    requestId: getRequestIdFromHeaders(request.headers),
    method: request.method,
    path: request.path,
    routerKind: context.routerKind,
    routePath: context.routePath,
    routeType: context.routeType,
    error: serializeError(error),
  });
};
