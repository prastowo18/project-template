import "dotenv/config";

import { createServerEnv } from "../src/env/schema";

const env = createServerEnv();

const pooledDatabaseUrl = new URL(env.DATABASE_URL);
const directDatabaseUrl = new URL(env.DIRECT_DATABASE_URL);
const authUrl = new URL(env.BETTER_AUTH_URL);

if (!pooledDatabaseUrl.hostname.includes("-pooler.")) {
  throw new Error("DATABASE_URL harus menggunakan pooled Neon connection.");
}

if (directDatabaseUrl.hostname.includes("-pooler.")) {
  throw new Error("DIRECT_DATABASE_URL harus menggunakan direct Neon connection.");
}

console.log("Environment variable valid.");
console.log(`Pooled database: ${pooledDatabaseUrl.hostname}`);
console.log(`Direct database: ${directDatabaseUrl.hostname}`);
console.log(`Auth origin: ${authUrl.origin}`);
console.log(`Auth secret length: ${env.BETTER_AUTH_SECRET.length}`);
