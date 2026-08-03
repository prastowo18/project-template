import { createAuthMiddleware } from "better-auth/api";

import { type AuthAuditIdentity, getAuditRequestContext, resolveAuthAuditEvent } from "@/audit";
import { logger, serializeError } from "@/observability";

type UnknownRecord = Record<string, unknown>;

type CreateAuthAuditHooksOptions = {
  enabled?: boolean;
};

function asRecord(value: unknown): UnknownRecord | undefined {
  return value && typeof value === "object" ? (value as UnknownRecord) : undefined;
}

function readString(record: UnknownRecord | undefined, key: string) {
  const value = record?.[key];

  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim();

  return normalized ? normalized : undefined;
}

function normalizeAuthIdentity(value: unknown): AuthAuditIdentity | undefined {
  const root = asRecord(value);

  if (!root) {
    return undefined;
  }

  const user = asRecord(root.user);

  const nestedSession = asRecord(root.session);

  const session = nestedSession ?? root;

  const userId = readString(user, "id") ?? readString(session, "userId");

  const email = readString(user, "email");

  const sessionId = readString(session, "id") ?? readString(session, "token");

  if (!userId && !email && !sessionId) {
    return undefined;
  }

  return {
    ...(userId
      ? {
          userId,
        }
      : {}),

    ...(email
      ? {
          email,
        }
      : {}),

    ...(sessionId
      ? {
          sessionId,
        }
      : {}),
  };
}

export function createAuthAuditHooks(options: CreateAuthAuditHooksOptions = {}) {
  const enabled = options.enabled ?? true;

  return {
    after: createAuthMiddleware(async (context) => {
      if (!enabled) {
        return;
      }

      const contextRecord = asRecord(context.context);

      const newSession = normalizeAuthIdentity(context.context.newSession);

      const currentSession = normalizeAuthIdentity(contextRecord?.session);

      const event = resolveAuthAuditEvent({
        path: context.path,
        body: context.body,

        ...(newSession
          ? {
              newSession,
            }
          : {}),

        ...(currentSession
          ? {
              currentSession,
            }
          : {}),
      });

      if (!event) {
        return;
      }

      const requestHeaders = context.headers ?? context.request?.headers;

      const requestContext = getAuditRequestContext(requestHeaders);

      try {
        const { safeWriteAuditLog } = await import("@/server/audit");

        await safeWriteAuditLog({
          ...event,
          ...requestContext,
        });
      } catch (error) {
        logger.error("auth.audit_hook_failed", {
          path: context.path,
          requestId: requestContext.requestId,
          error: serializeError(error),
        });
      }
    }),
  };
}
