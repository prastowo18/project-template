import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ROLES } from "@/authorization";
import { PERMISSIONS } from "@/authorization";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { grantRolePermission, listAdminRoles, revokeRolePermission } from "@/server/admin/roles";
import { getCurrentSession, hasPermissionForUser, requirePermission } from "@/server/authorization";

export const metadata: Metadata = {
  title: "Role dan Permission",
  description: "Administrasi permission pada setiap role aplikasi.",
};

type AdminRolesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const NOTICE_MESSAGES: Record<
  string,
  {
    title: string;
    description: string;
  }
> = {
  "permission-granted": {
    title: "Permission ditambahkan",
    description: "Permission berhasil diberikan kepada role.",
  },

  "permission-revoked": {
    title: "Permission dicabut",
    description: "Permission berhasil dicabut dari role.",
  },

  "permission-already-granted": {
    title: "Permission sudah tersedia",
    description: "Role tersebut sudah memiliki permission yang dipilih.",
  },

  "permission-assignment-not-found": {
    title: "Assignment tidak ditemukan",
    description: "Assignment mungkin sudah dihapus oleh proses lain.",
  },

  "role-not-found": {
    title: "Role tidak ditemukan",
    description: "Data role mungkin sudah berubah.",
  },

  "permission-not-found": {
    title: "Permission tidak ditemukan",
    description: "Data permission mungkin sudah berubah.",
  },

  "invalid-permission-assignment": {
    title: "Data tidak valid",
    description: "Role atau permission yang dikirim tidak valid.",
  },

  "superadmin-locked": {
    title: "Role dikunci",
    description:
      "Permission superadmin dikelola oleh katalog sistem dan tidak dapat diubah dari halaman ini.",
  },
};

function getFirstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminRolesPage({ searchParams }: AdminRolesPageProps) {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  await requirePermission({
    permission: PERMISSIONS.ROLE_READ,
  });

  const [result, canManageRoles] = await Promise.all([
    listAdminRoles(),

    hasPermissionForUser({
      userId: session.user.id,
      permission: PERMISSIONS.ROLE_MANAGE,
    }),
  ]);

  const rawSearchParams = await searchParams;

  const noticeKey = getFirstValue(rawSearchParams.notice);

  const notice = noticeKey ? NOTICE_MESSAGES[noticeKey] : undefined;

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Role dan Permission</h1>

        <p className="mt-1 text-muted-foreground">
          Atur permission yang dimiliki setiap role aplikasi.
        </p>
      </div>

      {notice ? (
        <div role="status" className="rounded-md border bg-muted px-4 py-3">
          <p className="font-medium">{notice.title}</p>

          <p className="text-sm text-muted-foreground">{notice.description}</p>
        </div>
      ) : null}

      <div className="grid gap-6">
        {result.roles.map((role) => {
          const assignedPermissionIds = new Set(
            role.permissions.map(({ permission }) => permission.id),
          );

          const availablePermissions = result.permissions.filter(
            (permission) => !assignedPermissionIds.has(permission.id),
          );

          const isSuperadmin = role.key === ROLES.SUPERADMIN;

          const canMutateRole = canManageRoles && !isSuperadmin;

          return (
            <Card key={role.id}>
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <CardTitle>{role.name}</CardTitle>

                    <CardDescription className="mt-1">
                      {role.description ?? "Tidak ada deskripsi."}
                    </CardDescription>
                  </div>

                  <div className="text-right text-sm text-muted-foreground">
                    <div className="font-mono">{role.key}</div>

                    <div>{role._count.userAssignments} assignment pengguna</div>

                    <div>{role.isSystem ? "Role sistem" : "Role kustom"}</div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="grid gap-5">
                {isSuperadmin ? (
                  <div className="rounded-md border bg-muted px-4 py-3 text-sm">
                    Permission superadmin dikunci dan mengikuti seluruh katalog permission sistem.
                  </div>
                ) : null}

                <div className="grid gap-2">
                  <h2 className="font-medium">Permission aktif</h2>

                  {role.permissions.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Role ini belum memiliki permission.
                    </p>
                  ) : (
                    <div className="grid gap-2 md:grid-cols-2">
                      {role.permissions.map(({ permission }) => (
                        <div
                          key={permission.id}
                          className="flex items-start justify-between gap-3 rounded-md border px-3 py-3"
                        >
                          <div>
                            <div className="font-medium">{permission.name}</div>

                            <div className="font-mono text-xs text-muted-foreground">
                              {permission.key}
                            </div>

                            {permission.description ? (
                              <p className="mt-1 text-sm text-muted-foreground">
                                {permission.description}
                              </p>
                            ) : null}
                          </div>

                          {canMutateRole ? (
                            <form action={revokeRolePermission}>
                              <input type="hidden" name="roleId" value={role.id} />

                              <input type="hidden" name="permissionId" value={permission.id} />

                              <Button type="submit" size="sm" variant="outline">
                                Cabut
                              </Button>
                            </form>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {canMutateRole ? (
                  <div className="grid gap-2">
                    <h2 className="font-medium">Tambahkan permission</h2>

                    {availablePermissions.length > 0 ? (
                      <form
                        action={grantRolePermission}
                        className="flex max-w-2xl flex-col gap-2 sm:flex-row"
                      >
                        <input type="hidden" name="roleId" value={role.id} />

                        <select
                          name="permissionId"
                          required
                          defaultValue=""
                          className="h-9 min-w-72 rounded-md border border-input bg-background px-3"
                        >
                          <option value="" disabled>
                            Pilih permission
                          </option>

                          {availablePermissions.map((permission) => (
                            <option key={permission.id} value={permission.id}>
                              {permission.key} — {permission.name}
                            </option>
                          ))}
                        </select>

                        <Button type="submit">Tambahkan</Button>
                      </form>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Seluruh permission sudah diberikan kepada role ini.
                      </p>
                    )}
                  </div>
                ) : !canManageRoles ? (
                  <p className="text-sm text-muted-foreground">
                    Anda tidak memiliki permission untuk mengubah assignment.
                  </p>
                ) : null}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
