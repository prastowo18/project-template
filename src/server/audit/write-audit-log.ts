import "server-only";

import {
  AUDIT_OUTCOMES,
  type AuditAction,
  type AuditCategory,
  type AuditOutcome,
  sanitizeAuditMetadata,
} from "@/audit";
import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/server/db/client";

export type WriteAuditLogInput = {
  action: AuditAction;
  category: AuditCategory;
  outcome?: AuditOutcome;

  actorUserId?: string | null;
  actorEmail?: string | null;

  subjectType?: string | null;
  subjectId?: string | null;

  scopeType?: string | null;
  scopeId?: string | null;

  requestId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;

  metadata?: Record<string, unknown>;
};

function normalizeOptionalText(value: string | null | undefined) {
  const normalized = value?.trim();

  return normalized ? normalized : undefined;
}

export async function writeAuditLog(input: WriteAuditLogInput) {
  const actorUserId = normalizeOptionalText(input.actorUserId);
  const actorEmail = normalizeOptionalText(input.actorEmail);
  const subjectType = normalizeOptionalText(input.subjectType);
  const subjectId = normalizeOptionalText(input.subjectId);
  const scopeType = normalizeOptionalText(input.scopeType);
  const scopeId = normalizeOptionalText(input.scopeId);
  const requestId = normalizeOptionalText(input.requestId);
  const ipAddress = normalizeOptionalText(input.ipAddress);
  const userAgent = normalizeOptionalText(input.userAgent);

  const metadata = input.metadata ? sanitizeAuditMetadata(input.metadata) : undefined;

  return db.auditLog.create({
    data: {
      action: input.action,
      category: input.category,
      outcome: input.outcome ?? AUDIT_OUTCOMES.SUCCESS,

      ...(actorUserId ? { actorUserId } : {}),
      ...(actorEmail ? { actorEmail } : {}),

      ...(subjectType ? { subjectType } : {}),
      ...(subjectId ? { subjectId } : {}),

      ...(scopeType ? { scopeType } : {}),
      ...(scopeId ? { scopeId } : {}),

      ...(requestId ? { requestId } : {}),
      ...(ipAddress ? { ipAddress } : {}),
      ...(userAgent ? { userAgent } : {}),

      ...(metadata
        ? {
            metadata: metadata as Prisma.InputJsonValue,
          }
        : {}),
    },
  });
}

export async function safeWriteAuditLog(input: WriteAuditLogInput): Promise<void> {
  try {
    await writeAuditLog(input);
  } catch (error) {
    console.error("Audit log could not be written.", error);
  }
}
