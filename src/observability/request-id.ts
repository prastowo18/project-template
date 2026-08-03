const REQUEST_ID_PATTERN = /^[A-Za-z0-9._:-]{1,128}$/;

export function normalizeRequestId(value: string | null | undefined): string | undefined {
  const normalized = value?.trim();

  if (!normalized || !REQUEST_ID_PATTERN.test(normalized)) {
    return undefined;
  }

  return normalized;
}

export function createRequestId(incomingRequestId?: string | null): string {
  return normalizeRequestId(incomingRequestId) ?? crypto.randomUUID();
}

export function getRequestIdFromHeaders(headers: unknown): string | undefined {
  if (typeof Headers !== "undefined" && headers instanceof Headers) {
    return normalizeRequestId(headers.get("x-request-id"));
  }

  if (!headers || typeof headers !== "object") {
    return undefined;
  }

  for (const [key, value] of Object.entries(headers)) {
    if (key.toLowerCase() !== "x-request-id") {
      continue;
    }

    if (typeof value === "string") {
      return normalizeRequestId(value);
    }

    if (Array.isArray(value) && typeof value[0] === "string") {
      return normalizeRequestId(value[0]);
    }
  }

  return undefined;
}
