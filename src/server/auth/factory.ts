import { prismaAdapter } from "better-auth/adapters/prisma";
import { betterAuth } from "better-auth/minimal";
import { nextCookies } from "better-auth/next-js";

import { ROLES } from "@/authorization";
import { APPLICATION } from "@/config";
import { createAuthRateLimitConfig, createRegistrationPolicy } from "@/security";
import { createAuthAuditHooks } from "@/server/auth/audit-hooks";
import type { AppPrismaClient } from "@/server/db/factory";

type CreateAuthOptions = {
  database: AppPrismaClient;
  baseURL: string;
  secret: string;
  autoSignIn?: boolean;
  assignDefaultRole?: boolean;
  publicRegistrationEnabled?: boolean;
};

export function createAuth({
  database,
  baseURL,
  secret,
  autoSignIn = true,
  assignDefaultRole = true,
  publicRegistrationEnabled = false,
}: CreateAuthOptions) {
  return betterAuth({
    appName: APPLICATION.name,

    baseURL,
    secret,

    rateLimit: createAuthRateLimitConfig(),

    hooks: createAuthAuditHooks({
      enabled: assignDefaultRole,
    }),

    database: prismaAdapter(database, {
      provider: "postgresql",
    }),

    databaseHooks: {
      user: {
        create: {
          after: async (user) => {
            if (!assignDefaultRole) {
              return;
            }

            const memberRole = await database.role.findUnique({
              where: {
                key: ROLES.MEMBER,
              },
              select: {
                id: true,
              },
            });

            if (!memberRole) {
              throw new Error('Role default "member" belum tersedia. Jalankan pnpm db:seed.');
            }

            await database.userRole.upsert({
              where: {
                userId_roleId_scopeType_scopeId: {
                  userId: user.id,
                  roleId: memberRole.id,
                  scopeType: "global",
                  scopeId: "*",
                },
              },
              update: {},
              create: {
                userId: user.id,
                roleId: memberRole.id,
                scopeType: "global",
                scopeId: "*",
              },
            });
          },
        },
      },
    },

    emailAndPassword: {
      enabled: true,

      ...createRegistrationPolicy(publicRegistrationEnabled),

      autoSignIn,
      minPasswordLength: 12,
      maxPasswordLength: 128,
    },

    plugins: [
      // Harus menjadi plugin terakhir.
      nextCookies(),
    ],
  });
}
