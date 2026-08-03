import { prismaAdapter } from "better-auth/adapters/prisma";
import { betterAuth } from "better-auth/minimal";
import { nextCookies } from "better-auth/next-js";

import type { AppPrismaClient } from "@/server/db/factory";

type CreateAuthOptions = {
  database: AppPrismaClient;
  baseURL: string;
  secret: string;
};

export function createAuth({ database, baseURL, secret }: CreateAuthOptions) {
  return betterAuth({
    appName: "Next.js Standard Template",

    baseURL,
    secret,

    database: prismaAdapter(database, {
      provider: "postgresql",
    }),

    emailAndPassword: {
      enabled: true,
      minPasswordLength: 12,
    },

    plugins: [
      // Harus menjadi plugin terakhir.
      nextCookies(),
    ],
  });
}
