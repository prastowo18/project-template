import { describe, expect, it } from "vitest";

import { normalizeAuditLogQuery } from "@/audit";

describe("normalizeAuditLogQuery", () => {
  it("menghasilkan nilai default", () => {
    expect(normalizeAuditLogQuery({})).toEqual({
      page: 1,
      action: "",
      category: "",
      outcome: "",
      search: "",
    });
  });

  it("membersihkan filter dan halaman", () => {
    expect(
      normalizeAuditLogQuery({
        page: "3",
        action: " auth.login ",
        category: " auth ",
        outcome: " success ",
        search: " user@example.com ",
      }),
    ).toEqual({
      page: 3,
      action: "auth.login",
      category: "auth",
      outcome: "success",
      search: "user@example.com",
    });
  });

  it("menggunakan nilai pertama dari array", () => {
    expect(
      normalizeAuditLogQuery({
        page: ["2", "4"],
        action: ["auth.logout", "auth.login"],
      }),
    ).toEqual({
      page: 2,
      action: "auth.logout",
      category: "",
      outcome: "",
      search: "",
    });
  });

  it("mengganti halaman tidak valid menjadi satu", () => {
    expect(
      normalizeAuditLogQuery({
        page: "-10",
      }).page,
    ).toBe(1);

    expect(
      normalizeAuditLogQuery({
        page: "invalid",
      }).page,
    ).toBe(1);
  });
});
