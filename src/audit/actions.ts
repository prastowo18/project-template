export const AUDIT_CATEGORIES = {
  AUTH: "auth",
  ACCESS: "access",
  USER: "user",
  ROLE: "role",
  PERMISSION: "permission",
  SYSTEM: "system",
} as const;

export type AuditCategory = (typeof AUDIT_CATEGORIES)[keyof typeof AUDIT_CATEGORIES];

export const AUDIT_OUTCOMES = {
  SUCCESS: "success",
  FAILURE: "failure",
  DENIED: "denied",
} as const;

export type AuditOutcome = (typeof AUDIT_OUTCOMES)[keyof typeof AUDIT_OUTCOMES];

export const AUDIT_ACTIONS = {
  AUTH_REGISTER: "auth.register",
  AUTH_LOGIN: "auth.login",
  AUTH_LOGIN_FAILED: "auth.login.failed",
  AUTH_LOGOUT: "auth.logout",
  AUTH_PASSWORD_CHANGED: "auth.password.changed",
  AUTH_SESSION_REVOKED: "auth.session.revoked",

  ACCESS_GRANTED: "access.granted",
  ACCESS_DENIED: "access.denied",

  USER_CREATED: "user.created",
  USER_UPDATED: "user.updated",
  USER_DELETED: "user.deleted",

  ROLE_ASSIGNED: "role.assigned",
  ROLE_REMOVED: "role.removed",
  ROLE_UPDATED: "role.updated",

  PERMISSION_GRANTED: "permission.granted",
  PERMISSION_REVOKED: "permission.revoked",

  SYSTEM_CONFIGURATION_UPDATED: "system.configuration.updated",
} as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[keyof typeof AUDIT_ACTIONS];
