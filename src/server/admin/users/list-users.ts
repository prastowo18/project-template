import "server-only";

import { ADMIN_USER_PAGE_SIZE, type AdminUserQuery } from "@/admin/users";
import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/server/db/client";

function buildWhere(query: AdminUserQuery): Prisma.UserWhereInput {
  if (!query.search) {
    return {};
  }

  return {
    OR: [
      {
        name: {
          contains: query.search,
          mode: "insensitive",
        },
      },
      {
        email: {
          contains: query.search,
          mode: "insensitive",
        },
      },
      {
        id: {
          contains: query.search,
          mode: "insensitive",
        },
      },
    ],
  };
}

export async function listAdminUsers(query: AdminUserQuery) {
  const where = buildWhere(query);

  const totalCount = await db.user.count({
    where,
  });

  const totalPages = Math.max(1, Math.ceil(totalCount / ADMIN_USER_PAGE_SIZE));

  const page = Math.min(query.page, totalPages);

  const [items, roles] = await Promise.all([
    db.user.findMany({
      where,
      orderBy: [
        {
          name: "asc",
        },
        {
          email: "asc",
        },
      ],
      skip: (page - 1) * ADMIN_USER_PAGE_SIZE,
      take: ADMIN_USER_PAGE_SIZE,
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        createdAt: true,
        roleAssignments: {
          where: {
            scopeType: "global",
            scopeId: "*",
          },
          orderBy: {
            createdAt: "asc",
          },
          select: {
            id: true,
            createdAt: true,
            role: {
              select: {
                id: true,
                key: true,
                name: true,
                description: true,
                isSystem: true,
              },
            },
          },
        },
      },
    }),

    db.role.findMany({
      orderBy: [
        {
          isSystem: "desc",
        },
        {
          name: "asc",
        },
      ],
      select: {
        id: true,
        key: true,
        name: true,
        description: true,
        isSystem: true,
      },
    }),
  ]);

  return {
    items,
    roles,
    page,
    pageSize: ADMIN_USER_PAGE_SIZE,
    totalCount,
    totalPages,
  };
}
