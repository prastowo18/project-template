import "server-only";

import { AUDIT_LOG_PAGE_SIZE, type AuditLogQuery } from "@/audit";
import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/server/db/client";

function buildWhere(query: AuditLogQuery): Prisma.AuditLogWhereInput {
  const conditions: Prisma.AuditLogWhereInput[] = [];

  if (query.action) {
    conditions.push({
      action: {
        contains: query.action,
        mode: "insensitive",
      },
    });
  }

  if (query.category) {
    conditions.push({
      category: query.category,
    });
  }

  if (query.outcome) {
    conditions.push({
      outcome: query.outcome,
    });
  }

  if (query.search) {
    conditions.push({
      OR: [
        {
          actorEmail: {
            contains: query.search,
            mode: "insensitive",
          },
        },
        {
          actorUserId: {
            contains: query.search,
            mode: "insensitive",
          },
        },
        {
          subjectId: {
            contains: query.search,
            mode: "insensitive",
          },
        },
        {
          subjectType: {
            contains: query.search,
            mode: "insensitive",
          },
        },
        {
          requestId: {
            contains: query.search,
            mode: "insensitive",
          },
        },
        {
          ipAddress: {
            contains: query.search,
            mode: "insensitive",
          },
        },
      ],
    });
  }

  return conditions.length > 0
    ? {
        AND: conditions,
      }
    : {};
}

export async function listAuditLogs(query: AuditLogQuery) {
  const where = buildWhere(query);

  const totalCount = await db.auditLog.count({
    where,
  });

  const totalPages = Math.max(1, Math.ceil(totalCount / AUDIT_LOG_PAGE_SIZE));

  const page = Math.min(query.page, totalPages);

  const items = await db.auditLog.findMany({
    where,
    orderBy: [
      {
        createdAt: "desc",
      },
      {
        id: "desc",
      },
    ],
    skip: (page - 1) * AUDIT_LOG_PAGE_SIZE,
    take: AUDIT_LOG_PAGE_SIZE,
    select: {
      id: true,
      action: true,
      category: true,
      outcome: true,
      actorUserId: true,
      actorEmail: true,
      subjectType: true,
      subjectId: true,
      scopeType: true,
      scopeId: true,
      requestId: true,
      ipAddress: true,
      createdAt: true,
    },
  });

  return {
    items,
    page,
    pageSize: AUDIT_LOG_PAGE_SIZE,
    totalCount,
    totalPages,
  };
}
