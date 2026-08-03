import "server-only";

import { env } from "@/env/server";
import { type AppPrismaClient, createPrismaClient } from "@/server/db/factory";

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: AppPrismaClient;
};

export const db = globalForPrisma.prisma ?? createPrismaClient(env.DATABASE_URL);

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
