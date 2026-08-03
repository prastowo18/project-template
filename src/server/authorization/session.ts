import "server-only";

import { headers } from "next/headers";

import { auth } from "@/server/auth";

import { AuthenticationRequiredError } from "./errors";

export async function getCurrentSession() {
  return auth.api.getSession({
    headers: await headers(),
  });
}

export type CurrentSession = NonNullable<Awaited<ReturnType<typeof getCurrentSession>>>;

export async function requireSession(): Promise<CurrentSession> {
  const session = await getCurrentSession();

  if (!session) {
    throw new AuthenticationRequiredError();
  }

  return session;
}
