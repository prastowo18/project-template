import { describe, expect, it } from "vitest";

import { PERMISSION_DEFINITIONS, PERMISSIONS, ROLE_DEFINITIONS, ROLES } from "@/authorization";

describe("authorization catalog", () => {
  const permissionKeys = Object.values(PERMISSIONS);
  const roleKeys = Object.values(ROLES);

  it("memiliki permission key yang unik", () => {
    expect(new Set(permissionKeys).size).toBe(permissionKeys.length);

    expect(PERMISSION_DEFINITIONS).toHaveLength(permissionKeys.length);
  });

  it("memiliki role key yang unik", () => {
    expect(new Set(roleKeys).size).toBe(roleKeys.length);

    expect(ROLE_DEFINITIONS).toHaveLength(roleKeys.length);
  });

  it("hanya menggunakan permission yang dikenal", () => {
    const knownPermissions = new Set(permissionKeys);

    for (const role of ROLE_DEFINITIONS) {
      for (const permission of role.permissions) {
        expect(knownPermissions.has(permission)).toBe(true);
      }
    }
  });

  it("member tidak memiliki permission administratif", () => {
    const memberRole = ROLE_DEFINITIONS.find(({ key }) => key === ROLES.MEMBER);

    expect(memberRole).toBeDefined();
    expect(memberRole?.permissions).toHaveLength(0);
  });

  it("superadmin memiliki seluruh permission", () => {
    const superadminRole = ROLE_DEFINITIONS.find(({ key }) => key === ROLES.SUPERADMIN);

    expect(superadminRole).toBeDefined();

    expect(new Set(superadminRole?.permissions)).toEqual(new Set(permissionKeys));
  });
});
