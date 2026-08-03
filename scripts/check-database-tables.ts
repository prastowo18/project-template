import "dotenv/config";

import { PrismaNeon } from "@prisma/adapter-neon";

import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DIRECT_DATABASE_URL;

if (!connectionString) {
  throw new Error("DIRECT_DATABASE_URL belum tersedia.");
}

const adapter = new PrismaNeon({
  connectionString,
});

const db = new PrismaClient({
  adapter,
});

type DatabaseTable = {
  tablename: string;
};

async function main() {
  const tables = await db.$queryRaw<DatabaseTable[]>`
    SELECT tablename::text AS tablename
    FROM pg_tables
    WHERE schemaname = 'public'
    ORDER BY tablename::text
  `;

  const tableNames = tables.map(({ tablename }) => tablename);

  const requiredTables = [
    "_prisma_migrations",
    "account",
    "app_permission",
    "app_role",
    "role_permission",
    "session",
    "user",
    "user_role",
    "verification",
  ];

  for (const tableName of requiredTables) {
    if (!tableNames.includes(tableName)) {
      throw new Error(`Tabel wajib "${tableName}" tidak ditemukan.`);
    }
  }

  console.log("Database tables:");
  console.log(tableNames.join("\n"));
  console.log(`Seluruh ${requiredTables.length} tabel wajib tersedia.`);
}

main()
  .catch((error: unknown) => {
    console.error("Pengecekan tabel database gagal:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
