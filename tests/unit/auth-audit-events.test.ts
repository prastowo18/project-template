import { describe, expect, it } from "vitest";

import {
  AUDIT_ACTIONS,
  AUDIT_OUTCOMES,
  getAuditRequestContext,
  resolveAuthAuditEvent,
} from "@/audit";

describe("resolveAuthAuditEvent", () => {
  it("mencatat registrasi berhasil", () => {
    const result = resolveAuthAuditEvent({
      path: "/sign-up/email",
      newSession: {
        userId: "user-001",
        email: " USER@EXAMPLE.COM ",
        sessionId: "session-001",
      },
    });

    expect(result).toEqual(
      expect.objectContaining({
        action: AUDIT_ACTIONS.AUTH_REGISTER,
        outcome: AUDIT_OUTCOMES.SUCCESS,
        actorUserId: "user-001",
        actorEmail: "user@example.com",
        subjectType: "user",
        subjectId: "user-001",
      }),
    );
  });

  it("mencatat login berhasil", () => {
    const result = resolveAuthAuditEvent({
      path: "/sign-in/email",
      newSession: {
        userId: "user-001",
        email: "user@example.com",
        sessionId: "session-001",
      },
    });

    expect(result).toEqual(
      expect.objectContaining({
        action: AUDIT_ACTIONS.AUTH_LOGIN,
        outcome: AUDIT_OUTCOMES.SUCCESS,
        actorUserId: "user-001",
      }),
    );
  });

  it("mencatat login gagal tanpa password", () => {
    const result = resolveAuthAuditEvent({
      path: "/sign-in/email",
      body: {
        email: " USER@EXAMPLE.COM ",
        password: "must-not-be-recorded",
        rememberMe: true,
      },
    });

    expect(result).toEqual({
      action: AUDIT_ACTIONS.AUTH_LOGIN_FAILED,
      category: "auth",
      outcome: AUDIT_OUTCOMES.FAILURE,
      actorEmail: "user@example.com",
      metadata: {
        endpoint: "/sign-in/email",
      },
    });

    expect(JSON.stringify(result)).not.toContain("must-not-be-recorded");
  });

  it("mencatat logout", () => {
    const result = resolveAuthAuditEvent({
      path: "/sign-out",
      currentSession: {
        userId: "user-001",
        email: "user@example.com",
        sessionId: "session-001",
      },
    });

    expect(result).toEqual(
      expect.objectContaining({
        action: AUDIT_ACTIONS.AUTH_LOGOUT,
        outcome: AUDIT_OUTCOMES.SUCCESS,
        actorUserId: "user-001",
        subjectId: "user-001",
      }),
    );
  });

  it("mengabaikan endpoint yang tidak diaudit", () => {
    expect(
      resolveAuthAuditEvent({
        path: "/get-session",
      }),
    ).toBeNull();
  });
});

describe("getAuditRequestContext", () => {
  it("mengambil request ID, IP pertama, dan user-agent", () => {
    const headers = new Headers({
      "x-request-id": "request-001",
      "x-forwarded-for": "203.0.113.10, 10.0.0.1",
      "user-agent": "Playwright",
    });

    expect(getAuditRequestContext(headers)).toEqual({
      requestId: "request-001",
      ipAddress: "203.0.113.10",
      userAgent: "Playwright",
    });
  });

  it("menghasilkan object kosong tanpa headers", () => {
    expect(getAuditRequestContext()).toEqual({});
  });
});
