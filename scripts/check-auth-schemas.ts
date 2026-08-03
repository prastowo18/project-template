import { AUTH_VALIDATION, loginSchema, registerSchema } from "../src/features/auth";

const validLogin = loginSchema.parse({
  email: "admin@example.com",
  password: "secure-password-123",
  rememberMe: true,
});

if (validLogin.email !== "admin@example.com") {
  throw new Error("Login email tidak sesuai.");
}

const invalidLogin = loginSchema.safeParse({
  email: "invalid-email",
  password: "short",
  rememberMe: true,
});

if (invalidLogin.success) {
  throw new Error("Data login tidak valid justru diterima.");
}

const validRegistration = registerSchema.parse({
  name: "Template Administrator",
  email: "administrator@example.com",
  password: "secure-password-123",
  passwordConfirmation: "secure-password-123",
  acceptTerms: true,
});

if (validRegistration.name !== "Template Administrator") {
  throw new Error("Data registrasi valid tidak dapat diproses.");
}

const mismatchedPassword = registerSchema.safeParse({
  name: "Template Administrator",
  email: "administrator@example.com",
  password: "secure-password-123",
  passwordConfirmation: "different-password-123",
  acceptTerms: true,
});

if (mismatchedPassword.success) {
  throw new Error("Konfirmasi password berbeda justru diterima.");
}

const termsNotAccepted = registerSchema.safeParse({
  name: "Template Administrator",
  email: "administrator@example.com",
  password: "secure-password-123",
  passwordConfirmation: "secure-password-123",
  acceptTerms: false,
});

if (termsNotAccepted.success) {
  throw new Error("Registrasi tanpa persetujuan justru diterima.");
}

console.log("Login schema valid.");
console.log("Registration schema valid.");
console.log(
  `Password standard: ${AUTH_VALIDATION.PASSWORD_MIN_LENGTH}-${AUTH_VALIDATION.PASSWORD_MAX_LENGTH} karakter.`,
);
console.log("Password confirmation validation valid.");
console.log("Terms validation valid.");
