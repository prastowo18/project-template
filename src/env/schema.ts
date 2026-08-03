import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const databaseUrlSchema = z
  .string()
  .url()
  .refine((value) => value.startsWith("postgresql://") || value.startsWith("postgres://"), {
    message: "DATABASE_URL harus menggunakan protokol postgresql:// atau postgres://",
  });

export function createServerEnv(runtimeEnv: NodeJS.ProcessEnv = process.env) {
  const skipValidation =
    runtimeEnv.SKIP_ENV_VALIDATION === "1" || runtimeEnv.SKIP_ENV_VALIDATION === "true";

  return createEnv({
    server: {
      DATABASE_URL: databaseUrlSchema,
    },

    experimental__runtimeEnv: runtimeEnv,

    emptyStringAsUndefined: true,

    skipValidation,
  });
}
