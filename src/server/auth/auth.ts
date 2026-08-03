import "server-only";

import { prismaAdapter } from "better-auth/adapters/prisma";
import { betterAuth } from "better-auth/minimal";
import { nextCookies } from "better-auth/next-js";

import { env } from "@/env/server";
import { db } from "@/server/db";

export const auth = betterAuth({
  appName: "Next.js Standard Template",

  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,

  database: prismaAdapter(db, {
    provider: "postgresql",
  }),

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 12,
  },

  plugins: [
    // Harus menjadi plugin terakhir agar cookie dari Server Action diterapkan.
    nextCookies(),
  ],
});

export type AuthSession = typeof auth.$Infer.Session;
