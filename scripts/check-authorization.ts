import {
  getAuthorizationScopeCandidates,
  PERMISSION_DEFINITIONS,
  PERMISSIONS,
} from "../src/authorization";

const permissionKeys = Object.values(PERMISSIONS);
const uniquePermissionKeys = new Set(permissionKeys);

if (permissionKeys.length !== uniquePermissionKeys.size) {
  throw new Error("Terdapat permission key yang duplikat.");
}

if (PERMISSION_DEFINITIONS.length !== permissionKeys.length) {
  throw new Error("Jumlah definisi permission tidak sesuai dengan katalog.");
}

const organizationScopes = getAuthorizationScopeCandidates({
  type: "organization",
  id: "organization-demo",
});

const actualScopes = organizationScopes.map(({ type, id }) => `${type}:${id}`);

const expectedScopes = ["global:*", "organization:*", "organization:organization-demo"];

if (JSON.stringify(actualScopes) !== JSON.stringify(expectedScopes)) {
  throw new Error(`Scope tidak sesuai: ${JSON.stringify(actualScopes)}`);
}

let invalidScopeRejected = false;

try {
  getAuthorizationScopeCandidates({
    type: "",
    id: "demo",
  });
} catch {
  invalidScopeRejected = true;
}

if (!invalidScopeRejected) {
  throw new Error("Scope kosong seharusnya ditolak.");
}

console.log(`Permission catalog valid: ${permissionKeys.length} permission.`);
console.log(`Scope candidates valid: ${actualScopes.join(", ")}`);
console.log("Invalid scope berhasil ditolak.");
