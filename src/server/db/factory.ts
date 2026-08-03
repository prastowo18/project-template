import { PrismaNeon } from "@prisma/adapter-neon";

import { PrismaClient } from "@/generated/prisma/client";

export function createPrismaClient(connectionString: string) {
  const adapter = new PrismaNeon({
    connectionString,
  });

  return new PrismaClient({
    adapter,
  });
}

export type AppPrismaClient = ReturnType<typeof createPrismaClient>;
