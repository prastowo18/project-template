import "server-only";

import { db } from "@/server/db/client";

export async function listAdminRoles() {
  const [roles, permissions] = await Promise.all([
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
        createdAt: true,

        _count: {
          select: {
            userAssignments: true,
          },
        },

        permissions: {
          select: {
            createdAt: true,
            permission: {
              select: {
                id: true,
                key: true,
                name: true,
                description: true,
              },
            },
          },
        },
      },
    }),

    db.permission.findMany({
      orderBy: {
        key: "asc",
      },
      select: {
        id: true,
        key: true,
        name: true,
        description: true,
      },
    }),
  ]);

  return {
    roles: roles.map((role) => ({
      ...role,
      permissions: [...role.permissions].sort((left, right) =>
        left.permission.key.localeCompare(right.permission.key),
      ),
    })),

    permissions,
  };
}
