import { describe, expect, it } from "vitest";

import {
  createLogRecord,
  createRequestId,
  getRequestIdFromHeaders,
  normalizeRequestId,
  sanitizeLogFields,
  serializeError,
} from "@/observability";

describe("request correlation ID", () => {
  it("menerima request ID yang valid", () => {
    expect(normalizeRequestId(" request-2026:001 ")).toBe("request-2026:001");
  });

  it("menolak request ID tidak valid", () => {
    expect(normalizeRequestId("request id with spaces")).toBeUndefined();

    expect(normalizeRequestId("x".repeat(129))).toBeUndefined();
  });

  it("mempertahankan ID masuk yang valid", () => {
    expect(createRequestId("request-existing")).toBe("request-existing");
  });

  it("menghasilkan UUID ketika ID tidak valid", () => {
    expect(createRequestId("invalid request")).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });

  it("membaca request ID dari Headers", () => {
    expect(
      getRequestIdFromHeaders(
        new Headers({
          "x-request-id": "request-header",
        }),
      ),
    ).toBe("request-header");
  });
});

describe("structured logger", () => {
  it("menyamarkan field sensitif", () => {
    expect(
      sanitizeLogFields({
        email: "user@example.com",
        password: "plain-password",
        nested: {
          accessToken: "secret-token",
          apiKey: "secret-key",
        },
      }),
    ).toEqual({
      email: "user@example.com",
      password: "[REDACTED]",
      nested: {
        accessToken: "[REDACTED]",
        apiKey: "[REDACTED]",
      },
    });
  });

  it("menangani object circular", () => {
    const circular: Record<string, unknown> = {};

    circular.self = circular;

    expect(
      sanitizeLogFields({
        circular,
      }),
    ).toEqual({
      circular: {
        self: "[CIRCULAR]",
      },
    });
  });

  it("menserialisasi Error", () => {
    const result = serializeError(new Error("Test failure"));

    expect(result).toEqual(
      expect.objectContaining({
        name: "Error",
        message: "Test failure",
      }),
    );
  });

  it("membuat record dengan field standar", () => {
    const record = createLogRecord("info", "test.completed", {
      requestId: "request-001",
      secret: "must-not-appear",
    });

    expect(record).toEqual(
      expect.objectContaining({
        level: "info",
        event: "test.completed",
        service: "nextjs-standard-template",
        requestId: "request-001",
        secret: "[REDACTED]",
        timestamp: expect.any(String),
      }),
    );
  });
});
