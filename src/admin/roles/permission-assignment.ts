import { z } from "zod";

import { ROLES } from "@/authorization";

export const permissionAssignmentSchema = z.object({
  roleId: z.string().trim().min(1).max(191),
  permissionId: z.string().trim().min(1).max(191),
});

export type PermissionMutationBlockReason = "superadmin-locked";

type PermissionMutationPolicyInput = {
  roleKey: string;
};

export function getPermissionMutationBlockReason({
  roleKey,
}: PermissionMutationPolicyInput): PermissionMutationBlockReason | null {
  if (roleKey === ROLES.SUPERADMIN) {
    return "superadmin-locked";
  }

  return null;
}
