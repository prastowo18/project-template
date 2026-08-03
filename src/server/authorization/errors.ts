import type { PermissionKey } from "@/authorization";

export class AuthenticationRequiredError extends Error {
  readonly code = "AUTHENTICATION_REQUIRED";
  readonly statusCode = 401;

  constructor() {
    super("Pengguna harus login untuk mengakses resource ini.");
    this.name = "AuthenticationRequiredError";
  }
}

export class AuthorizationDeniedError extends Error {
  readonly code = "AUTHORIZATION_DENIED";
  readonly statusCode = 403;
  readonly permission: PermissionKey;

  constructor(permission: PermissionKey) {
    super(`Permission "${permission}" diperlukan.`);
    this.name = "AuthorizationDeniedError";
    this.permission = permission;
  }
}
