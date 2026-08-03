import { describe, expect, it } from "vitest";

import { getAuthorizationScopeCandidates, GLOBAL_SCOPE } from "@/authorization";

describe("getAuthorizationScopeCandidates", () => {
  it("menghasilkan satu kandidat untuk scope global", () => {
    expect(getAuthorizationScopeCandidates()).toEqual([GLOBAL_SCOPE]);
  });

  it("menghasilkan global, wildcard, dan exact scope", () => {
    expect(
      getAuthorizationScopeCandidates({
        type: "organization",
        id: "organization-001",
      }),
    ).toEqual([
      {
        type: "global",
        id: "*",
      },
      {
        type: "organization",
        id: "*",
      },
      {
        type: "organization",
        id: "organization-001",
      },
    ]);
  });

  it("menghapus spasi pada nilai scope", () => {
    expect(
      getAuthorizationScopeCandidates({
        type: " unit ",
        id: " unit-001 ",
      }),
    ).toContainEqual({
      type: "unit",
      id: "unit-001",
    });
  });

  it("menolak type atau id yang kosong", () => {
    expect(() =>
      getAuthorizationScopeCandidates({
        type: "",
        id: "unit-001",
      }),
    ).toThrow("scope.type tidak boleh kosong.");

    expect(() =>
      getAuthorizationScopeCandidates({
        type: "unit",
        id: "   ",
      }),
    ).toThrow("scope.id tidak boleh kosong.");
  });
});
