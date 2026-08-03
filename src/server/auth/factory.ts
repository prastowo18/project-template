import { prismaAdapter } from "better-auth/adapters/prisma";
import { betterAuth } from "better-auth/minimal";
import { nextCookies } from "better-auth/next-js";

import { ROLES } from "@/authorization";
import type { AppPrismaClient } from "@/server/db/factory";

type CreateAuthOptions = {
  database: AppPrismaClient;
  baseURL: string;
  secret: string;
  autoSignIn?: boolean;
  assignDefaultRole?: boolean;
};

export function createAuth({
  database,
  baseURL,
  secret,
  autoSignIn = true,
  assignDefaultRole = true,
}: CreateAuthOptions) {
  return betterAuth({
    appName: "Next.js Standard Template",

    baseURL,
    secret,

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
      autoSignIn,
      minPasswordLength: 12,
    },

    plugins: [
      // Harus menjadi plugin terakhir.
      nextCookies(),
    ],
  });
}
