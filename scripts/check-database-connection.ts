import "dotenv/config";

import { createPrismaClient } from "../src/server/db/factory";

async function checkConnection(label: string, connectionString: string) {
  const client = createPrismaClient(connectionString);

  try {
    await client.$queryRaw`SELECT 1`;
    console.log(`${label}: connected`);
  } finally {
    await client.$disconnect();
  }
}

async function main() {
  const pooledUrl = process.env.DATABASE_URL;
  const directUrl = process.env.DIRECT_DATABASE_URL;

  if (!pooledUrl) {
    throw new Error("DATABASE_URL belum tersedia.");
  }

  if (!directUrl) {
    throw new Error("DIRECT_DATABASE_URL belum tersedia.");
  }

  await checkConnection("Pooled connection", pooledUrl);
  await checkConnection("Direct connection", directUrl);
}

main().catch((error: unknown) => {
  console.error("Database connection check gagal:", error);
  process.exitCode = 1;
});
