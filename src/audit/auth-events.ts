import {
  AUDIT_ACTIONS,
  AUDIT_CATEGORIES,
  AUDIT_OUTCOMES,
  type AuditAction,
  type AuditCategory,
  type AuditOutcome,
} from "./actions";

export type AuthAuditIdentity = {
  userId?: string | null;
  email?: string | null;
  sessionId?: string | null;
};

export type ResolveAuthAuditEventInput = {
  path: string;
  body?: unknown;
  newSession?: AuthAuditIdentity;
  currentSession?: AuthAuditIdentity;
};

export type ResolvedAuthAuditEvent = {
  action: AuditAction;
  category: AuditCategory;
  outcome: AuditOutcome;

  actorUserId?: string;
  actorEmail?: string;

  subjectType?: string;
  subjectId?: string;

  metadata: Record<string, unknown>;
};

function normalizeText(value: string | null | undefined) {
  const normalized = value?.trim();

  return normalized ? normalized : undefined;
}

function normalizeEmail(value: string | null | undefined) {
  return normalizeText(value)?.toLowerCase();
}

function getEmailFromBody(body: unknown) {
  if (!body || typeof body !== "object" || !("email" in body)) {
    return undefined;
  }

  const email = body.email;

  return typeof email === "string" ? normalizeEmail(email) : undefined;
}

function createMetadata(endpoint: string, identity?: AuthAuditIdentity) {
  const sessionId = normalizeText(identity?.sessionId);

  return {
    endpoint,
    ...(sessionId ? { sessionId } : {}),
  };
}

export function resolveAuthAuditEvent(
  input: ResolveAuthAuditEventInput,
): ResolvedAuthAuditEvent | null {
  const { path } = input;

  if (path === "/sign-up/email") {
    const userId = normalizeText(input.newSession?.userId);

    if (!userId) {
      return null;
    }

    const email = normalizeEmail(input.newSession?.email);

    return {
      action: AUDIT_ACTIONS.AUTH_REGISTER,
      category: AUDIT_CATEGORIES.AUTH,
      outcome: AUDIT_OUTCOMES.SUCCESS,
      actorUserId: userId,
      ...(email ? { actorEmail: email } : {}),
      subjectType: "user",
      subjectId: userId,
      metadata: createMetadata(path, input.newSession),
    };
  }

  if (path === "/sign-in/email") {
    const userId = normalizeText(input.newSession?.userId);

    if (userId) {
      const email = normalizeEmail(input.newSession?.email);

      return {
        action: AUDIT_ACTIONS.AUTH_LOGIN,
        category: AUDIT_CATEGORIES.AUTH,
        outcome: AUDIT_OUTCOMES.SUCCESS,
        actorUserId: userId,
        ...(email ? { actorEmail: email } : {}),
        subjectType: "user",
        subjectId: userId,
        metadata: createMetadata(path, input.newSession),
      };
    }

    const attemptedEmail = getEmailFromBody(input.body);

    return {
      action: AUDIT_ACTIONS.AUTH_LOGIN_FAILED,
      category: AUDIT_CATEGORIES.AUTH,
      outcome: AUDIT_OUTCOMES.FAILURE,
      ...(attemptedEmail ? { actorEmail: attemptedEmail } : {}),
      metadata: {
        endpoint: path,
      },
    };
  }

  if (path === "/sign-out") {
    const userId = normalizeText(input.currentSession?.userId);
    const email = normalizeEmail(input.currentSession?.email);

    return {
      action: AUDIT_ACTIONS.AUTH_LOGOUT,
      category: AUDIT_CATEGORIES.AUTH,
      outcome: AUDIT_OUTCOMES.SUCCESS,
      ...(userId
        ? {
            actorUserId: userId,
            subjectType: "user",
            subjectId: userId,
          }
        : {}),
      ...(email ? { actorEmail: email } : {}),
      metadata: createMetadata(path, input.currentSession),
    };
  }

  return null;
}
