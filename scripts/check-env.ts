import { createServerEnv } from "../src/env/schema";

const env = createServerEnv();
const databaseUrl = new URL(env.DATABASE_URL);
const authUrl = new URL(env.BETTER_AUTH_URL);

console.log("Environment variable valid.");
console.log(`Database protocol: ${databaseUrl.protocol}`);
console.log(`Database hostname: ${databaseUrl.hostname}`);
console.log(`Auth origin: ${authUrl.origin}`);
console.log(`Auth secret length: ${env.BETTER_AUTH_SECRET.length}`);
