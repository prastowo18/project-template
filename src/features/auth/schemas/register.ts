import { z } from "zod";

import { AUTH_VALIDATION } from "./constants";

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(
        AUTH_VALIDATION.NAME_MIN_LENGTH,
        `Nama minimal ${AUTH_VALIDATION.NAME_MIN_LENGTH} karakter.`,
      )
      .max(
        AUTH_VALIDATION.NAME_MAX_LENGTH,
        `Nama maksimal ${AUTH_VALIDATION.NAME_MAX_LENGTH} karakter.`,
      ),

    email: z
      .string()
      .trim()
      .min(1, "Email wajib diisi.")
      .max(AUTH_VALIDATION.EMAIL_MAX_LENGTH, "Email terlalu panjang.")
      .email("Format email tidak valid."),

    password: z
      .string()
      .min(
        AUTH_VALIDATION.PASSWORD_MIN_LENGTH,
        `Password minimal ${AUTH_VALIDATION.PASSWORD_MIN_LENGTH} karakter.`,
      )
      .max(
        AUTH_VALIDATION.PASSWORD_MAX_LENGTH,
        `Password maksimal ${AUTH_VALIDATION.PASSWORD_MAX_LENGTH} karakter.`,
      ),

    passwordConfirmation: z.string().min(1, "Konfirmasi password wajib diisi."),

    acceptTerms: z.boolean().refine((value) => value, {
      message: "Anda harus menyetujui syarat dan ketentuan.",
    }),
  })
  .superRefine(({ password, passwordConfirmation }, context) => {
    if (password !== passwordConfirmation) {
      context.addIssue({
        code: "custom",
        path: ["passwordConfirmation"],
        message: "Konfirmasi password tidak sama.",
      });
    }
  });

export type RegisterFormInput = z.input<typeof registerSchema>;

export type RegisterFormData = z.output<typeof registerSchema>;
