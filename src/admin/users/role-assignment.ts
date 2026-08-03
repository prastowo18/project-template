import { z } from "zod";

import { ROLES } from "@/authorization";

export const roleAssignmentSchema = z.object({
  userId: z.string().trim().min(1).max(191),
  roleId: z.string().trim().min(1).max(191),
});

export type RoleAssignmentInput = z.infer<typeof roleAssignmentSchema>;

export type RoleRemovalBlockReason = "self-superadmin" | "last-superadmin";

type RoleRemovalPolicyInput = {
  actorUserId: string;
  targetUserId: string;
  roleKey: string;
  globalSuperadminCount: number;
};

export function getRoleRemovalBlockReason({
  actorUserId,
  targetUserId,
  roleKey,
  globalSuperadminCount,
}: RoleRemovalPolicyInput): RoleRemovalBlockReason | null {
  if (roleKey !== ROLES.SUPERADMIN) {
    return null;
  }

  if (actorUserId === targetUserId) {
    return "self-superadmin";
  }

  if (globalSuperadminCount <= 1) {
    return "last-superadmin";
  }

  return null;
}
