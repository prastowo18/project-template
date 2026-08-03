import { z } from "zod";

import { AUTH_VALIDATION } from "./constants";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email wajib diisi.")
    .max(AUTH_VALIDATION.EMAIL_MAX_LENGTH, "Email terlalu panjang.")
    .email("Format email tidak valid."),

  password: z
    .string()
    .min(1, "Password wajib diisi.")
    .min(
      AUTH_VALIDATION.PASSWORD_MIN_LENGTH,
      `Password minimal ${AUTH_VALIDATION.PASSWORD_MIN_LENGTH} karakter.`,
    )
    .max(
      AUTH_VALIDATION.PASSWORD_MAX_LENGTH,
      `Password maksimal ${AUTH_VALIDATION.PASSWORD_MAX_LENGTH} karakter.`,
    ),

  rememberMe: z.boolean(),
});

export type LoginFormInput = z.input<typeof loginSchema>;

export type LoginFormData = z.output<typeof loginSchema>;
