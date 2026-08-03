import "server-only";

import { redirect } from "next/navigation";

import { type AuthorizationScope, GLOBAL_SCOPE, type PermissionKey } from "@/authorization";

import { hasPermissionForUser } from "./access";
import { type CurrentSession, getCurrentSession } from "./session";

export async function requirePermissionOrRedirect(
  permission: PermissionKey,
  scope: AuthorizationScope = GLOBAL_SCOPE,
): Promise<CurrentSession> {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  const isAllowed = await hasPermissionForUser({
    userId: session.user.id,
    permission,
    scope,
  });

  if (!isAllowed) {
    redirect("/forbidden");
  }

  return session;
}
