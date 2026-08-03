export type AuditRequestContext = {
  requestId?: string;
  ipAddress?: string;
  userAgent?: string;
};

function normalizeHeader(value: string | null | undefined) {
  const normalized = value?.trim();

  return normalized ? normalized : undefined;
}

function getForwardedIp(headers: Headers) {
  const forwardedFor = normalizeHeader(headers.get("x-forwarded-for"));

  if (forwardedFor) {
    return normalizeHeader(forwardedFor.split(",")[0]);
  }

  return (
    normalizeHeader(headers.get("x-real-ip")) ?? normalizeHeader(headers.get("cf-connecting-ip"))
  );
}

export function getAuditRequestContext(headers?: Headers): AuditRequestContext {
  if (!headers) {
    return {};
  }

  const requestId =
    normalizeHeader(headers.get("x-request-id")) ??
    normalizeHeader(headers.get("x-vercel-id")) ??
    normalizeHeader(headers.get("traceparent"));

  const ipAddress = getForwardedIp(headers);

  const userAgent = normalizeHeader(headers.get("user-agent"));

  return {
    ...(requestId ? { requestId } : {}),
    ...(ipAddress ? { ipAddress } : {}),
    ...(userAgent ? { userAgent } : {}),
  };
}
