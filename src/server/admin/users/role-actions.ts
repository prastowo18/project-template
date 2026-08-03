"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getRoleRemovalBlockReason, roleAssignmentSchema } from "@/admin/users";
import { AUDIT_ACTIONS, AUDIT_CATEGORIES } from "@/audit";
import { PERMISSIONS, ROLES } from "@/authorization";
import { safeWriteAuditLog } from "@/server/audit";
import { requirePermission } from "@/server/authorization";
import { db } from "@/server/db/client";

function redirectToUsers(notice: string): never {
  const params = new URLSearchParams({
    notice,
  });

  redirect(`/admin/users?${params.toString()}`);
}

function parseAssignmentForm(formData: FormData) {
  return roleAssignmentSchema.safeParse({
    userId: formData.get("userId"),
    roleId: formData.get("roleId"),
  });
}

async function requireRoleAssignmentAccess() {
  const session = await requirePermission({
    permission: PERMISSIONS.USER_UPDATE,
  });

  await requirePermission({
    permission: PERMISSIONS.ROLE_MANAGE,
  });

  return session;
}

function finishMutation(notice: string): never {
  revalidatePath("/admin/users");
  revalidatePath("/", "layout");

  redirectToUsers(notice);
}

export async function assignGlobalRole(formData: FormData) {
  const session = await requireRoleAssignmentAccess();

  const parsed = parseAssignmentForm(formData);

  if (!parsed.success) {
    redirectToUsers("invalid-role-assignment");
  }

  const { userId, roleId } = parsed.data;

  const result = await db.$transaction(async (transaction) => {
    const [user, role, existingAssignment] = await Promise.all([
      transaction.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          id: true,
          email: true,
        },
      }),

      transaction.role.findUnique({
        where: {
          id: roleId,
        },
        select: {
          id: true,
          key: true,
          name: true,
        },
      }),

      transaction.userRole.findUnique({
        where: {
          userId_roleId_scopeType_scopeId: {
            userId,
            roleId,
            scopeType: "global",
            scopeId: "*",
          },
        },
        select: {
          id: true,
        },
      }),
    ]);

    if (!user) {
      return {
        status: "user-not-found" as const,
      };
    }

    if (!role) {
      return {
        status: "role-not-found" as const,
      };
    }

    if (existingAssignment) {
      return {
        status: "role-already-assigned" as const,
      };
    }

    await transaction.userRole.create({
      data: {
        userId,
        roleId,
        scopeType: "global",
        scopeId: "*",
      },
    });

    return {
      status: "success" as const,
      user,
      role,
    };
  });

  if (result.status !== "success") {
    redirectToUsers(result.status);
  }

  await safeWriteAuditLog({
    action: AUDIT_ACTIONS.ROLE_ASSIGNED,
    category: AUDIT_CATEGORIES.ROLE,
    actorUserId: session.user.id,
    actorEmail: session.user.email,
    subjectType: "user",
    subjectId: result.user.id,
    scopeType: "global",
    scopeId: "*",
    metadata: {
      targetEmail: result.user.email,
      roleId: result.role.id,
      roleKey: result.role.key,
      roleName: result.role.name,
    },
  });

  finishMutation("role-assigned");
}

export async function removeGlobalRole(formData: FormData) {
  const session = await requireRoleAssignmentAccess();

  const parsed = parseAssignmentForm(formData);

  if (!parsed.success) {
    redirectToUsers("invalid-role-assignment");
  }

  const { userId, roleId } = parsed.data;

  const assignment = await db.userRole.findUnique({
    where: {
      userId_roleId_scopeType_scopeId: {
        userId,
        roleId,
        scopeType: "global",
        scopeId: "*",
      },
    },
    select: {
      id: true,
      user: {
        select: {
          id: true,
          email: true,
        },
      },
      role: {
        select: {
          id: true,
          key: true,
          name: true,
        },
      },
    },
  });

  if (!assignment) {
    redirectToUsers("role-assignment-not-found");
  }

  const globalSuperadminCount =
    assignment.role.key === ROLES.SUPERADMIN
      ? await db.userRole.count({
          where: {
            roleId: assignment.role.id,
            scopeType: "global",
            scopeId: "*",
          },
        })
      : 0;

  const blockReason = getRoleRemovalBlockReason({
    actorUserId: session.user.id,
    targetUserId: assignment.user.id,
    roleKey: assignment.role.key,
    globalSuperadminCount,
  });

  if (blockReason) {
    redirectToUsers(blockReason);
  }

  await db.userRole.delete({
    where: {
      id: assignment.id,
    },
  });

  await safeWriteAuditLog({
    action: AUDIT_ACTIONS.ROLE_REMOVED,
    category: AUDIT_CATEGORIES.ROLE,
    actorUserId: session.user.id,
    actorEmail: session.user.email,
    subjectType: "user",
    subjectId: assignment.user.id,
    scopeType: "global",
    scopeId: "*",
    metadata: {
      targetEmail: assignment.user.email,
      roleId: assignment.role.id,
      roleKey: assignment.role.key,
      roleName: assignment.role.name,
    },
  });

  finishMutation("role-removed");
}
