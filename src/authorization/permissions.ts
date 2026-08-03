export const PERMISSIONS = {
  SYSTEM_MANAGE: "system.manage",

  USER_READ: "user.read",
  USER_CREATE: "user.create",
  USER_UPDATE: "user.update",
  USER_DELETE: "user.delete",

  ROLE_READ: "role.read",
  ROLE_MANAGE: "role.manage",

  AUDIT_READ: "audit.read",
} as const;

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export type PermissionDefinition = {
  key: PermissionKey;
  name: string;
  description: string;
};

export const PERMISSION_DEFINITIONS = [
  {
    key: PERMISSIONS.SYSTEM_MANAGE,
    name: "Manage system",
    description: "Mengelola konfigurasi inti aplikasi.",
  },
  {
    key: PERMISSIONS.USER_READ,
    name: "Read users",
    description: "Melihat data pengguna.",
  },
  {
    key: PERMISSIONS.USER_CREATE,
    name: "Create users",
    description: "Membuat pengguna baru.",
  },
  {
    key: PERMISSIONS.USER_UPDATE,
    name: "Update users",
    description: "Mengubah data pengguna.",
  },
  {
    key: PERMISSIONS.USER_DELETE,
    name: "Delete users",
    description: "Menghapus pengguna.",
  },
  {
    key: PERMISSIONS.ROLE_READ,
    name: "Read roles",
    description: "Melihat role dan permission.",
  },
  {
    key: PERMISSIONS.ROLE_MANAGE,
    name: "Manage roles",
    description: "Mengelola role dan assignment permission.",
  },
  {
    key: PERMISSIONS.AUDIT_READ,
    name: "Read audit logs",
    description: "Melihat catatan audit aplikasi.",
  },
] as const satisfies readonly PermissionDefinition[];
