import "server-only";

import {
  type AuthorizationScope,
  getAuthorizationScopeCandidates,
  GLOBAL_SCOPE,
  type PermissionKey,
} from "@/authorization";
import { db } from "@/server/db";

import { AuthorizationDeniedError } from "./errors";
import { type CurrentSession, requireSession } from "./session";

export type PermissionCheck = {
  userId: string;
  permission: PermissionKey;
  scope?: AuthorizationScope;
};

export type PermissionRequirement = Omit<PermissionCheck, "userId">;

export async function hasPermissionForUser({
  userId,
  permission,
  scope = GLOBAL_SCOPE,
}: PermissionCheck): Promise<boolean> {
  const normalizedUserId = userId.trim();

  if (!normalizedUserId) {
    return false;
  }

  const scopeCandidates = getAuthorizationScopeCandidates(scope).map(({ type, id }) => ({
    scopeType: type,
    scopeId: id,
  }));

  const assignment = await db.userRole.findFirst({
    where: {
      userId: normalizedUserId,
      OR: scopeCandidates,
      role: {
        permissions: {
          some: {
            permission: {
              key: permission,
            },
          },
        },
      },
    },
    select: {
      id: true,
    },
  });

  return assignment !== null;
}

export async function requirePermission({
  permission,
  scope = GLOBAL_SCOPE,
}: PermissionRequirement): Promise<CurrentSession> {
  const session = await requireSession();

  const isAllowed = await hasPermissionForUser({
    userId: session.user.id,
    permission,
    scope,
  });

  if (!isAllowed) {
    throw new AuthorizationDeniedError(permission);
  }

  return session;
}
