import { describe, expect, it } from "vitest";

import { getPermissionMutationBlockReason, permissionAssignmentSchema } from "@/admin/roles";
import { ROLES } from "@/authorization";

describe("permissionAssignmentSchema", () => {
  it("menerima assignment yang valid", () => {
    expect(
      permissionAssignmentSchema.safeParse({
        roleId: "role-001",
        permissionId: "permission-001",
      }).success,
    ).toBe(true);
  });

  it("membersihkan spasi pada ID", () => {
    expect(
      permissionAssignmentSchema.parse({
        roleId: " role-001 ",
        permissionId: " permission-001 ",
      }),
    ).toEqual({
      roleId: "role-001",
      permissionId: "permission-001",
    });
  });

  it("menolak role ID kosong", () => {
    expect(
      permissionAssignmentSchema.safeParse({
        roleId: "",
        permissionId: "permission-001",
      }).success,
    ).toBe(false);
  });

  it("menolak permission ID kosong", () => {
    expect(
      permissionAssignmentSchema.safeParse({
        roleId: "role-001",
        permissionId: "",
      }).success,
    ).toBe(false);
  });
});

describe("permission mutation policy", () => {
  it("mengunci permission superadmin", () => {
    expect(
      getPermissionMutationBlockReason({
        roleKey: ROLES.SUPERADMIN,
      }),
    ).toBe("superadmin-locked");
  });

  it("mengizinkan perubahan role lainnya", () => {
    expect(
      getPermissionMutationBlockReason({
        roleKey: ROLES.ADMIN,
      }),
    ).toBeNull();

    expect(
      getPermissionMutationBlockReason({
        roleKey: ROLES.MEMBER,
      }),
    ).toBeNull();
  });
});
