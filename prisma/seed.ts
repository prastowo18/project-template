import "dotenv/config";

import { z } from "zod";

import { PERMISSION_DEFINITIONS, ROLE_DEFINITIONS, ROLES } from "../src/authorization";
import { createAuth } from "../src/server/auth/factory";
import { createPrismaClient } from "../src/server/db/factory";

const optionalText = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().optional(),
);

const seedEnvironmentSchema = z.object({
  DATABASE_URL: z
    .string()
    .url()
    .refine(
      (value) => value.startsWith("postgresql://") || value.startsWith("postgres://"),
      "DATABASE_URL harus menggunakan PostgreSQL.",
    ),

  BETTER_AUTH_SECRET: z.string().min(32, "BETTER_AUTH_SECRET minimal 32 karakter"),

  BETTER_AUTH_URL: z.url(),

  INITIAL_SUPERADMIN_NAME: optionalText.default("Super Administrator"),

  INITIAL_SUPERADMIN_EMAIL: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.email().optional(),
  ),

  INITIAL_SUPERADMIN_PASSWORD: z.preprocess(
    (value) => (typeof value === "string" && value === "" ? undefined : value),
    z.string().min(12, "Password superadmin minimal 12 karakter").max(128).optional(),
  ),
});

const env = seedEnvironmentSchema.parse(process.env);
const db = createPrismaClient(env.DATABASE_URL);

async function seedAuthorizationCatalog() {
  await db.$transaction(async (transaction) => {
    for (const definition of PERMISSION_DEFINITIONS) {
      await transaction.permission.upsert({
        where: {
          key: definition.key,
        },
        update: {
          name: definition.name,
          description: definition.description,
        },
        create: {
          key: definition.key,
          name: definition.name,
          description: definition.description,
        },
      });
    }

    const permissions = await transaction.permission.findMany({
      where: {
        key: {
          in: PERMISSION_DEFINITIONS.map(({ key }) => key),
        },
      },
      select: {
        id: true,
        key: true,
      },
    });

    const permissionIdByKey = new Map(permissions.map(({ id, key }) => [key, id]));

    for (const definition of ROLE_DEFINITIONS) {
      const role = await transaction.role.upsert({
        where: {
          key: definition.key,
        },
        update: {
          name: definition.name,
          description: definition.description,
          isSystem: definition.isSystem,
        },
        create: {
          key: definition.key,
          name: definition.name,
          description: definition.description,
          isSystem: definition.isSystem,
        },
      });

      const permissionIds = definition.permissions.map((permissionKey) => {
        const permissionId = permissionIdByKey.get(permissionKey);

        if (!permissionId) {
          throw new Error(`Permission "${permissionKey}" tidak ditemukan.`);
        }

        return permissionId;
      });

      if (permissionIds.length === 0) {
        await transaction.rolePermission.deleteMany({
          where: {
            roleId: role.id,
          },
        });
      } else {
        await transaction.rolePermission.deleteMany({
          where: {
            roleId: role.id,
            permissionId: {
              notIn: permissionIds,
            },
          },
        });
      }

      for (const permissionId of permissionIds) {
        await transaction.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId: role.id,
              permissionId,
            },
          },
          update: {},
          create: {
            roleId: role.id,
            permissionId,
          },
        });
      }
    }
  });

  console.log(
    `Seed authorization selesai: ${PERMISSION_DEFINITIONS.length} permission dan ${ROLE_DEFINITIONS.length} role.`,
  );
}

async function seedInitialSuperadmin() {
  const email = env.INITIAL_SUPERADMIN_EMAIL?.trim().toLowerCase();

  if (!email) {
    console.log("INITIAL_SUPERADMIN_EMAIL tidak diisi. Bootstrap superadmin dilewati.");
    return;
  }

  let user = await db.user.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
      email: true,
    },
  });

  if (!user) {
    const password = env.INITIAL_SUPERADMIN_PASSWORD;

    if (!password) {
      throw new Error("INITIAL_SUPERADMIN_PASSWORD diperlukan untuk membuat superadmin baru.");
    }

    const seedAuth = createAuth({
      database: db,
      baseURL: env.BETTER_AUTH_URL,
      secret: env.BETTER_AUTH_SECRET,
      autoSignIn: false,
    });

    await seedAuth.api.signUpEmail({
      body: {
        name: env.INITIAL_SUPERADMIN_NAME ?? "Super Administrator",
        email,
        password,
      },
    });

    user = await db.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
        email: true,
      },
    });
  }

  if (!user) {
    throw new Error("User superadmin tidak ditemukan setelah proses pembuatan.");
  }

  const superadminRole = await db.role.findUnique({
    where: {
      key: ROLES.SUPERADMIN,
    },
    select: {
      id: true,
    },
  });

  if (!superadminRole) {
    throw new Error("Role superadmin belum tersedia.");
  }

  await db.userRole.upsert({
    where: {
      userId_roleId_scopeType_scopeId: {
        userId: user.id,
        roleId: superadminRole.id,
        scopeType: "global",
        scopeId: "*",
      },
    },
    update: {},
    create: {
      userId: user.id,
      roleId: superadminRole.id,
      scopeType: "global",
      scopeId: "*",
    },
  });

  console.log(`Superadmin global tersedia untuk ${user.email}.`);
}

async function main() {
  await seedAuthorizationCatalog();
  await seedInitialSuperadmin();
}

main()
  .catch((error: unknown) => {
    console.error("Seed database gagal:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
