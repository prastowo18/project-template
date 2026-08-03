import { describe, expect, it } from "vitest";

import {
  getRoleRemovalBlockReason,
  normalizeAdminUserQuery,
  roleAssignmentSchema,
} from "@/admin/users";
import { ROLES } from "@/authorization";

describe("normalizeAdminUserQuery", () => {
  it("menghasilkan nilai default", () => {
    expect(normalizeAdminUserQuery({})).toEqual({
      page: 1,
      search: "",
    });
  });

  it("membersihkan pencarian dan halaman", () => {
    expect(
      normalizeAdminUserQuery({
        page: "3",
        search: " user@example.com ",
      }),
    ).toEqual({
      page: 3,
      search: "user@example.com",
    });
  });

  it("menggunakan nilai pertama dari array", () => {
    expect(
      normalizeAdminUserQuery({
        page: ["2", "5"],
        search: ["User", "Admin"],
      }),
    ).toEqual({
      page: 2,
      search: "User",
    });
  });

  it("mengganti halaman tidak valid menjadi satu", () => {
    expect(
      normalizeAdminUserQuery({
        page: "-1",
      }).page,
    ).toBe(1);
  });
});

describe("role assignment policy", () => {
  it("menerima assignment yang valid", () => {
    expect(
      roleAssignmentSchema.safeParse({
        userId: "user-001",
        roleId: "role-001",
      }).success,
    ).toBe(true);
  });

  it("menolak ID kosong", () => {
    expect(
      roleAssignmentSchema.safeParse({
        userId: "",
        roleId: "role-001",
      }).success,
    ).toBe(false);
  });

  it("mencegah penghapusan superadmin sendiri", () => {
    expect(
      getRoleRemovalBlockReason({
        actorUserId: "user-001",
        targetUserId: "user-001",
        roleKey: ROLES.SUPERADMIN,
        globalSuperadminCount: 2,
      }),
    ).toBe("self-superadmin");
  });

  it("mencegah penghapusan superadmin terakhir", () => {
    expect(
      getRoleRemovalBlockReason({
        actorUserId: "user-001",
        targetUserId: "user-002",
        roleKey: ROLES.SUPERADMIN,
        globalSuperadminCount: 1,
      }),
    ).toBe("last-superadmin");
  });

  it("mengizinkan penghapusan role biasa", () => {
    expect(
      getRoleRemovalBlockReason({
        actorUserId: "user-001",
        targetUserId: "user-001",
        roleKey: ROLES.MEMBER,
        globalSuperadminCount: 0,
      }),
    ).toBeNull();
  });
});
