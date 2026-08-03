import "dotenv/config";

import { PrismaNeon } from "@prisma/adapter-neon";

import { PERMISSION_DEFINITIONS } from "../src/authorization/permissions";
import { ROLE_DEFINITIONS, ROLES } from "../src/authorization/roles";
import { PrismaClient } from "../src/generated/prisma/client";

function getRequiredEnvironmentVariable(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Environment variable "${name}" belum tersedia.`);
  }

  return value;
}

const connectionString =
  process.env.DIRECT_DATABASE_URL?.trim() || process.env.DATABASE_URL?.trim();

if (!connectionString) {
  throw new Error("DIRECT_DATABASE_URL atau DATABASE_URL harus tersedia.");
}

const superadminEmail = getRequiredEnvironmentVariable("CHECK_SUPERADMIN_EMAIL").toLowerCase();

const adapter = new PrismaNeon({
  connectionString,
});

const db = new PrismaClient({
  adapter,
});

function maskEmail(email: string) {
  const separatorIndex = email.indexOf("@");

  if (separatorIndex <= 0) {
    return "***";
  }

  const localPart = email.slice(0, separatorIndex);
  const domain = email.slice(separatorIndex + 1);
  const visiblePart = localPart.slice(0, Math.min(2, localPart.length));

  return `${visiblePart}***@${domain}`;
}

async function verifyPermissionCatalog() {
  const permissions = await db.permission.findMany({
    where: {
      key: {
        in: PERMISSION_DEFINITIONS.map(({ key }) => key),
      },
    },
    select: {
      key: true,
    },
  });

  if (permissions.length !== PERMISSION_DEFINITIONS.length) {
    throw new Error(
      `Permission tidak lengkap: ${permissions.length}/${PERMISSION_DEFINITIONS.length}.`,
    );
  }

  console.log(`Permission verified: ${permissions.length}.`);
}

async function verifyRoleCatalog() {
  const roles = await db.role.findMany({
    where: {
      key: {
        in: ROLE_DEFINITIONS.map(({ key }) => key),
      },
    },
    select: {
      key: true,
      permissions: {
        select: {
          permission: {
            select: {
              key: true,
            },
          },
        },
      },
    },
  });

  for (const definition of ROLE_DEFINITIONS) {
    const role = roles.find(({ key }) => key === definition.key);

    if (!role) {
      throw new Error(`Role "${definition.key}" tidak ditemukan.`);
    }

    const actualPermissions = new Set(role.permissions.map(({ permission }) => permission.key));

    const expectedPermissions = new Set(definition.permissions);

    if (actualPermissions.size !== expectedPermissions.size) {
      throw new Error(`Jumlah permission role "${definition.key}" tidak sesuai.`);
    }

    for (const permission of expectedPermissions) {
      if (!actualPermissions.has(permission)) {
        throw new Error(`Role "${definition.key}" tidak memiliki permission "${permission}".`);
      }
    }
  }

  console.log(`Role verified: ${roles.length}.`);
}

async function verifySuperadmin() {
  const user = await db.user.findUnique({
    where: {
      email: superadminEmail,
    },
    select: {
      email: true,
      accounts: {
        select: {
          providerId: true,
        },
      },
      roleAssignments: {
        where: {
          scopeType: "global",
          scopeId: "*",
          role: {
            key: ROLES.SUPERADMIN,
          },
        },
        select: {
          scopeType: true,
          scopeId: true,
          role: {
            select: {
              key: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    throw new Error("Akun superadmin tidak ditemukan.");
  }

  if (user.accounts.length === 0) {
    throw new Error("Credential account superadmin tidak ditemukan.");
  }

  const globalAssignment = user.roleAssignments.find(
    ({ role, scopeType, scopeId }) =>
      role.key === ROLES.SUPERADMIN && scopeType === "global" && scopeId === "*",
  );

  if (!globalAssignment) {
    throw new Error("Assignment superadmin global tidak ditemukan.");
  }

  console.log(`Superadmin verified: ${maskEmail(user.email)}.`);

  console.log(
    `Credential provider: ${user.accounts.map(({ providerId }) => providerId).join(", ")}.`,
  );
}

async function main() {
  await verifyPermissionCatalog();
  await verifyRoleCatalog();
  await verifySuperadmin();

  console.log("Seed database berhasil diverifikasi.");
}

main()
  .catch((error: unknown) => {
    console.error("Verifikasi seed database gagal:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
