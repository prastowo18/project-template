import "server-only";

import { env } from "@/env/server";
import { createAuth } from "@/server/auth/factory";
import { db } from "@/server/db";

export const auth = createAuth({
  database: db,
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
});

export type AuthSession = typeof auth.$Infer.Session;
