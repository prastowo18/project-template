import { type PermissionKey, PERMISSIONS } from "./permissions";

export const ROLES = {
  SUPERADMIN: "superadmin",
  ADMIN: "admin",
  MEMBER: "member",
} as const;

export type RoleKey = (typeof ROLES)[keyof typeof ROLES];

export type RoleDefinition = {
  key: RoleKey;
  name: string;
  description: string;
  isSystem: boolean;
  permissions: readonly PermissionKey[];
};

const ALL_PERMISSIONS = Object.values(PERMISSIONS) as PermissionKey[];

export const ROLE_DEFINITIONS = [
  {
    key: ROLES.SUPERADMIN,
    name: "Super Administrator",
    description: "Memiliki seluruh permission dan akses sistem.",
    isSystem: true,
    permissions: ALL_PERMISSIONS,
  },
  {
    key: ROLES.ADMIN,
    name: "Administrator",
    description: "Mengelola pengguna dan melihat konfigurasi operasional.",
    isSystem: true,
    permissions: [
      PERMISSIONS.USER_READ,
      PERMISSIONS.USER_CREATE,
      PERMISSIONS.USER_UPDATE,
      PERMISSIONS.ROLE_READ,
      PERMISSIONS.AUDIT_READ,
    ],
  },
  {
    key: ROLES.MEMBER,
    name: "Member",
    description: "Role dasar tanpa permission administratif.",
    isSystem: true,
    permissions: [],
  },
] as const satisfies readonly RoleDefinition[];
