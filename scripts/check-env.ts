import { createServerEnv } from "../src/env/schema";

const env = createServerEnv();
const databaseUrl = new URL(env.DATABASE_URL);

console.log("Environment variable valid.");
console.log(`Database protocol: ${databaseUrl.protocol}`);
console.log(`Database hostname: ${databaseUrl.hostname}`);
