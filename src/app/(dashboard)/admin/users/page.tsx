import type { Metadata } from "next";
import Link from "next/link";

import { type AdminUserQuery, normalizeAdminUserQuery } from "@/admin/users";
import { PERMISSIONS, ROLES } from "@/authorization";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { assignGlobalRole, listAdminUsers, removeGlobalRole } from "@/server/admin/users";
import { hasPermissionForUser, requirePermissionOrRedirect } from "@/server/authorization";

export const metadata: Metadata = {
  title: "Pengguna",
  description: "Administrasi pengguna dan assignment role global.",
};

type AdminUsersPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeZone: "Asia/Jakarta",
});

const NOTICE_MESSAGES: Record<
  string,
  {
    title: string;
    description: string;
  }
> = {
  "role-assigned": {
    title: "Role ditambahkan",
    description: "Assignment role global berhasil disimpan.",
  },
  "role-removed": {
    title: "Role dihapus",
    description: "Assignment role global berhasil dihapus.",
  },
  "role-already-assigned": {
    title: "Role sudah tersedia",
    description: "Pengguna tersebut sudah memiliki role yang dipilih.",
  },
  "role-assignment-not-found": {
    title: "Assignment tidak ditemukan",
    description: "Role mungkin sudah dihapus oleh proses lain.",
  },
  "user-not-found": {
    title: "Pengguna tidak ditemukan",
    description: "Data pengguna mungkin sudah berubah.",
  },
  "role-not-found": {
    title: "Role tidak ditemukan",
    description: "Data role mungkin sudah berubah.",
  },
  "invalid-role-assignment": {
    title: "Data tidak valid",
    description: "Pengguna atau role yang dikirim tidak valid.",
  },
  "self-superadmin": {
    title: "Tindakan diblokir",
    description: "Anda tidak dapat menghapus role superadmin milik sendiri.",
  },
  "last-superadmin": {
    title: "Tindakan diblokir",
    description: "Role superadmin terakhir tidak boleh dihapus.",
  },
};

function getFirstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function createPageHref(query: AdminUserQuery, page: number) {
  const params = new URLSearchParams();

  if (page > 1) {
    params.set("page", String(page));
  }

  if (query.search) {
    params.set("search", query.search);
  }

  const queryString = params.toString();

  return queryString ? `/admin/users?${queryString}` : "/admin/users";
}

export default async function AdminUsersPage({ searchParams }: AdminUsersPageProps) {
  const session = await requirePermissionOrRedirect(PERMISSIONS.USER_READ);

  const rawSearchParams = await searchParams;
  const query = normalizeAdminUserQuery(rawSearchParams);

  const [result, canUpdateUsers, canManageRoles] = await Promise.all([
    listAdminUsers(query),

    hasPermissionForUser({
      userId: session.user.id,
      permission: PERMISSIONS.USER_UPDATE,
    }),

    hasPermissionForUser({
      userId: session.user.id,
      permission: PERMISSIONS.ROLE_MANAGE,
    }),
  ]);

  const canChangeRoles = canUpdateUsers && canManageRoles;

  const noticeKey = getFirstValue(rawSearchParams.notice);

  const notice = noticeKey ? NOTICE_MESSAGES[noticeKey] : undefined;

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Pengguna</h1>

        <p className="mt-1 text-muted-foreground">
          Kelola assignment role global untuk pengguna aplikasi.
        </p>
      </div>

      {notice ? (
        <div role="status" className="rounded-md border bg-muted px-4 py-3">
          <p className="font-medium">{notice.title}</p>

          <p className="text-sm text-muted-foreground">{notice.description}</p>
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Pencarian</CardTitle>

          <CardDescription>Cari berdasarkan nama, email, atau ID pengguna.</CardDescription>
        </CardHeader>

        <CardContent>
          <form method="get" className="flex flex-col gap-3 sm:flex-row">
            <Input
              name="search"
              defaultValue={query.search}
              placeholder="Nama atau email"
              className="max-w-xl"
            />

            <div className="flex gap-2">
              <Button type="submit">Cari</Button>

              <Button variant="outline" asChild>
                <Link href="/admin/users">Reset</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daftar pengguna</CardTitle>

          <CardDescription>
            {result.totalCount} pengguna ditemukan. Assignment pada halaman ini berlaku untuk scope
            global.
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-4">
          <div className="overflow-x-auto rounded-md border">
            <table className="w-full min-w-5xl text-left text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-4 py-3 font-medium">Pengguna</th>
                  <th className="px-4 py-3 font-medium">Verifikasi</th>
                  <th className="px-4 py-3 font-medium">Dibuat</th>
                  <th className="px-4 py-3 font-medium">Role global</th>
                  <th className="px-4 py-3 font-medium">Tambah role</th>
                </tr>
              </thead>

              <tbody>
                {result.items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                      Pengguna tidak ditemukan.
                    </td>
                  </tr>
                ) : (
                  result.items.map((user) => {
                    const assignedRoleIds = new Set(
                      user.roleAssignments.map(({ role }) => role.id),
                    );

                    const availableRoles = result.roles.filter(
                      (role) => !assignedRoleIds.has(role.id),
                    );

                    return (
                      <tr key={user.id} className="border-b align-top last:border-0">
                        <td className="px-4 py-3">
                          <div className="font-medium">{user.name}</div>

                          <div className="text-muted-foreground">{user.email}</div>

                          <div className="mt-1 font-mono text-xs text-muted-foreground">
                            {user.id}
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          {user.emailVerified ? "Terverifikasi" : "Belum"}
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap">
                          {dateFormatter.format(user.createdAt)}
                        </td>

                        <td className="px-4 py-3">
                          <div className="grid gap-2">
                            {user.roleAssignments.length === 0 ? (
                              <span className="text-muted-foreground">
                                Belum memiliki role global.
                              </span>
                            ) : (
                              user.roleAssignments.map((assignment) => {
                                const isOwnSuperadmin =
                                  user.id === session.user.id &&
                                  assignment.role.key === ROLES.SUPERADMIN;

                                return (
                                  <div
                                    key={assignment.id}
                                    className="flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2"
                                  >
                                    <div>
                                      <div className="font-medium">{assignment.role.name}</div>

                                      <div className="font-mono text-xs text-muted-foreground">
                                        {assignment.role.key}
                                      </div>
                                    </div>

                                    {canChangeRoles ? (
                                      <form action={removeGlobalRole}>
                                        <input type="hidden" name="userId" value={user.id} />

                                        <input
                                          type="hidden"
                                          name="roleId"
                                          value={assignment.role.id}
                                        />

                                        <Button
                                          type="submit"
                                          size="sm"
                                          variant="outline"
                                          disabled={isOwnSuperadmin}
                                        >
                                          Hapus
                                        </Button>
                                      </form>
                                    ) : null}
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          {canChangeRoles ? (
                            availableRoles.length > 0 ? (
                              <form action={assignGlobalRole} className="grid min-w-48 gap-2">
                                <input type="hidden" name="userId" value={user.id} />

                                <select
                                  name="roleId"
                                  required
                                  defaultValue=""
                                  className="h-9 rounded-md border border-input bg-background px-3"
                                >
                                  <option value="" disabled>
                                    Pilih role
                                  </option>

                                  {availableRoles.map((role) => (
                                    <option key={role.id} value={role.id}>
                                      {role.name}
                                    </option>
                                  ))}
                                </select>

                                <Button type="submit" size="sm">
                                  Tambahkan
                                </Button>
                              </form>
                            ) : (
                              <span className="text-muted-foreground">
                                Semua role sudah diberikan.
                              </span>
                            )
                          ) : (
                            <span className="text-muted-foreground">
                              Tidak memiliki izin mengubah role.
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Halaman {result.page} dari {result.totalPages}
            </p>

            <div className="flex gap-2">
              <Button variant="outline" asChild disabled={result.page <= 1}>
                {result.page <= 1 ? (
                  <span>Sebelumnya</span>
                ) : (
                  <Link href={createPageHref(query, result.page - 1)}>Sebelumnya</Link>
                )}
              </Button>

              <Button variant="outline" asChild disabled={result.page >= result.totalPages}>
                {result.page >= result.totalPages ? (
                  <span>Berikutnya</span>
                ) : (
                  <Link href={createPageHref(query, result.page + 1)}>Berikutnya</Link>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
