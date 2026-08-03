"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getPermissionMutationBlockReason, permissionAssignmentSchema } from "@/admin/roles";
import { AUDIT_ACTIONS, AUDIT_CATEGORIES } from "@/audit";
import { PERMISSIONS } from "@/authorization";
import { safeWriteAuditLog } from "@/server/audit";
import { requirePermissionOrRedirect } from "@/server/authorization";
import { db } from "@/server/db/client";

function redirectToRoles(notice: string): never {
  const params = new URLSearchParams({
    notice,
  });

  redirect(`/admin/roles?${params.toString()}`);
}

function parsePermissionForm(formData: FormData) {
  return permissionAssignmentSchema.safeParse({
    roleId: formData.get("roleId"),
    permissionId: formData.get("permissionId"),
  });
}

async function requireRoleManagementAccess() {
  return requirePermissionOrRedirect(PERMISSIONS.ROLE_MANAGE);
}

function finishMutation(notice: string): never {
  revalidatePath("/admin/roles");
  revalidatePath("/admin/users");
  revalidatePath("/", "layout");

  redirectToRoles(notice);
}

export async function grantRolePermission(formData: FormData) {
  const session = await requireRoleManagementAccess();

  const parsed = parsePermissionForm(formData);

  if (!parsed.success) {
    redirectToRoles("invalid-permission-assignment");
  }

  const { roleId, permissionId } = parsed.data;

  const result = await db.$transaction(async (transaction) => {
    const [role, permission, existingAssignment] = await Promise.all([
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

      transaction.permission.findUnique({
        where: {
          id: permissionId,
        },
        select: {
          id: true,
          key: true,
          name: true,
        },
      }),

      transaction.rolePermission.findUnique({
        where: {
          roleId_permissionId: {
            roleId,
            permissionId,
          },
        },
        select: {
          roleId: true,
        },
      }),
    ]);

    if (!role) {
      return {
        status: "role-not-found" as const,
      };
    }

    if (!permission) {
      return {
        status: "permission-not-found" as const,
      };
    }

    const blockReason = getPermissionMutationBlockReason({
      roleKey: role.key,
    });

    if (blockReason) {
      return {
        status: "superadmin-locked" as const,
      };
    }

    if (existingAssignment) {
      return {
        status: "permission-already-granted" as const,
      };
    }

    await transaction.rolePermission.create({
      data: {
        roleId,
        permissionId,
      },
    });

    return {
      status: "success" as const,
      role,
      permission,
    };
  });

  if (result.status !== "success") {
    redirectToRoles(result.status);
  }

  await safeWriteAuditLog({
    action: AUDIT_ACTIONS.PERMISSION_GRANTED,
    category: AUDIT_CATEGORIES.PERMISSION,
    actorUserId: session.user.id,
    actorEmail: session.user.email,
    subjectType: "role",
    subjectId: result.role.id,
    metadata: {
      roleKey: result.role.key,
      roleName: result.role.name,
      permissionId: result.permission.id,
      permissionKey: result.permission.key,
      permissionName: result.permission.name,
    },
  });

  finishMutation("permission-granted");
}

export async function revokeRolePermission(formData: FormData) {
  const session = await requireRoleManagementAccess();

  const parsed = parsePermissionForm(formData);

  if (!parsed.success) {
    redirectToRoles("invalid-permission-assignment");
  }

  const { roleId, permissionId } = parsed.data;

  const result = await db.$transaction(async (transaction) => {
    const assignment = await transaction.rolePermission.findUnique({
      where: {
        roleId_permissionId: {
          roleId,
          permissionId,
        },
      },
      select: {
        role: {
          select: {
            id: true,
            key: true,
            name: true,
          },
        },

        permission: {
          select: {
            id: true,
            key: true,
            name: true,
          },
        },
      },
    });

    if (!assignment) {
      return {
        status: "permission-assignment-not-found" as const,
      };
    }

    const blockReason = getPermissionMutationBlockReason({
      roleKey: assignment.role.key,
    });

    if (blockReason) {
      return {
        status: "superadmin-locked" as const,
      };
    }

    await transaction.rolePermission.delete({
      where: {
        roleId_permissionId: {
          roleId,
          permissionId,
        },
      },
    });

    return {
      status: "success" as const,
      role: assignment.role,
      permission: assignment.permission,
    };
  });

  if (result.status !== "success") {
    redirectToRoles(result.status);
  }

  await safeWriteAuditLog({
    action: AUDIT_ACTIONS.PERMISSION_REVOKED,
    category: AUDIT_CATEGORIES.PERMISSION,
    actorUserId: session.user.id,
    actorEmail: session.user.email,
    subjectType: "role",
    subjectId: result.role.id,
    metadata: {
      roleKey: result.role.key,
      roleName: result.role.name,
      permissionId: result.permission.id,
      permissionKey: result.permission.key,
      permissionName: result.permission.name,
    },
  });

  finishMutation("permission-revoked");
}
