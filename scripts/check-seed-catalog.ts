import { PERMISSION_DEFINITIONS, PERMISSIONS, ROLE_DEFINITIONS, ROLES } from "../src/authorization";

const permissionKeys = Object.values(PERMISSIONS);
const permissionKeySet = new Set(permissionKeys);

if (permissionKeySet.size !== permissionKeys.length) {
  throw new Error("Permission key harus unik.");
}

const roleKeys = ROLE_DEFINITIONS.map(({ key }) => key);
const roleKeySet = new Set(roleKeys);

if (roleKeySet.size !== roleKeys.length) {
  throw new Error("Role key harus unik.");
}

for (const role of ROLE_DEFINITIONS) {
  const uniquePermissions = new Set(role.permissions);

  if (uniquePermissions.size !== role.permissions.length) {
    throw new Error(`Role "${role.key}" memiliki permission duplikat.`);
  }

  for (const permission of role.permissions) {
    if (!permissionKeySet.has(permission)) {
      throw new Error(`Role "${role.key}" menggunakan permission tidak dikenal: ${permission}`);
    }
  }
}

const superadmin = ROLE_DEFINITIONS.find(({ key }) => key === ROLES.SUPERADMIN);

if (!superadmin) {
  throw new Error("Role superadmin tidak tersedia.");
}

if (new Set(superadmin.permissions).size !== permissionKeySet.size) {
  throw new Error("Superadmin harus memiliki seluruh permission.");
}

if (PERMISSION_DEFINITIONS.length !== permissionKeySet.size) {
  throw new Error("Definisi permission tidak lengkap.");
}

console.log(
  `Seed catalog valid: ${ROLE_DEFINITIONS.length} role dan ${PERMISSION_DEFINITIONS.length} permission.`,
);
console.log(`Superadmin memiliki ${superadmin.permissions.length} permission.`);
