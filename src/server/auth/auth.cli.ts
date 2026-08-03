import { createServerEnv } from "@/env/schema";
import { createAuth } from "@/server/auth/factory";
import { createPrismaClient } from "@/server/db/factory";

const env = createServerEnv();

const database = createPrismaClient(env.DATABASE_URL);

export const auth = createAuth({
  database,
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
});
