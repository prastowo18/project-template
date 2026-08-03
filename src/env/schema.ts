import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

type RuntimeEnvironment = Record<string, string | undefined>;

const databaseUrlSchema = z
  .string()
  .url()
  .refine((value) => value.startsWith("postgresql://") || value.startsWith("postgres://"), {
    message: "Database URL harus menggunakan protokol postgresql:// atau postgres://",
  });

const authSecretSchema = z
  .string()
  .min(32, "BETTER_AUTH_SECRET minimal 32 karakter")
  .refine(
    (value) => !value.startsWith("replace-"),
    "BETTER_AUTH_SECRET masih menggunakan nilai contoh",
  );

const booleanStringSchema = z
  .enum(["true", "false"])
  .default("false")
  .transform((value) => value === "true");

export function createServerEnv(runtimeEnv: RuntimeEnvironment = process.env) {
  const skipValidation =
    runtimeEnv.SKIP_ENV_VALIDATION === "1" || runtimeEnv.SKIP_ENV_VALIDATION === "true";

  return createEnv({
    server: {
      DATABASE_URL: databaseUrlSchema,

      DIRECT_DATABASE_URL: databaseUrlSchema,

      BETTER_AUTH_SECRET: authSecretSchema,

      BETTER_AUTH_URL: z.url(),

      SITE_INDEXING_ENABLED: booleanStringSchema,
    },

    experimental__runtimeEnv: runtimeEnv,

    emptyStringAsUndefined: true,

    skipValidation,
  });
}
