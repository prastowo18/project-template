import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import {
  AUDIT_LOG_CATEGORIES,
  AUDIT_LOG_OUTCOMES,
  type AuditLogQuery,
  normalizeAuditLogQuery,
} from "@/audit";
import { PERMISSIONS } from "@/authorization";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { listAuditLogs } from "@/server/audit";
import { getCurrentSession, requirePermission } from "@/server/authorization";

export const metadata: Metadata = {
  title: "Audit Log",
  description: "Riwayat aktivitas keamanan dan administrasi aplikasi.",
};

type AuditLogsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "medium",
  timeZone: "Asia/Jakarta",
});

function createPageHref(query: AuditLogQuery, page: number) {
  const params = new URLSearchParams();

  if (page > 1) {
    params.set("page", String(page));
  }

  if (query.action) {
    params.set("action", query.action);
  }

  if (query.category) {
    params.set("category", query.category);
  }

  if (query.outcome) {
    params.set("outcome", query.outcome);
  }

  if (query.search) {
    params.set("search", query.search);
  }

  const queryString = params.toString();

  return queryString ? `/admin/audit-logs?${queryString}` : "/admin/audit-logs";
}

function displayValue(value: string | null) {
  return value ?? "—";
}

export default async function AuditLogsPage({ searchParams }: AuditLogsPageProps) {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  await requirePermission({
    permission: PERMISSIONS.AUDIT_READ,
  });

  const query = normalizeAuditLogQuery(await searchParams);

  const result = await listAuditLogs(query);

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Audit Log</h1>

        <p className="mt-1 text-muted-foreground">
          Riwayat aktivitas autentikasi, keamanan, dan administrasi aplikasi.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter</CardTitle>

          <CardDescription>
            Cari berdasarkan aksi, kategori, hasil, aktor, subjek, request ID, atau alamat IP.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form method="get" className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <label className="grid gap-2 text-sm">
              <span className="font-medium">Aksi</span>

              <Input name="action" defaultValue={query.action} placeholder="auth.login" />
            </label>

            <label className="grid gap-2 text-sm">
              <span className="font-medium">Kategori</span>

              <select
                name="category"
                defaultValue={query.category}
                className="h-9 rounded-md border border-input bg-background px-3"
              >
                <option value="">Semua kategori</option>

                {AUDIT_LOG_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 text-sm">
              <span className="font-medium">Hasil</span>

              <select
                name="outcome"
                defaultValue={query.outcome}
                className="h-9 rounded-md border border-input bg-background px-3"
              >
                <option value="">Semua hasil</option>

                {AUDIT_LOG_OUTCOMES.map((outcome) => (
                  <option key={outcome} value={outcome}>
                    {outcome}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 text-sm">
              <span className="font-medium">Pencarian</span>

              <Input name="search" defaultValue={query.search} placeholder="Email atau ID" />
            </label>

            <div className="flex items-end gap-2">
              <Button type="submit">Terapkan</Button>

              <Button variant="outline" asChild>
                <Link href="/admin/audit-logs">Reset</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Riwayat aktivitas</CardTitle>

          <CardDescription>{result.totalCount} catatan ditemukan.</CardDescription>
        </CardHeader>

        <CardContent className="grid gap-4">
          <div className="overflow-x-auto rounded-md border">
            <table className="w-full min-w-4xl text-left text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-4 py-3 font-medium">Waktu</th>
                  <th className="px-4 py-3 font-medium">Aksi</th>
                  <th className="px-4 py-3 font-medium">Hasil</th>
                  <th className="px-4 py-3 font-medium">Aktor</th>
                  <th className="px-4 py-3 font-medium">Subjek</th>
                  <th className="px-4 py-3 font-medium">IP</th>
                </tr>
              </thead>

              <tbody>
                {result.items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                      Belum ada audit log yang sesuai dengan filter.
                    </td>
                  </tr>
                ) : (
                  result.items.map((item) => (
                    <tr key={item.id} className="border-b last:border-0">
                      <td className="px-4 py-3 whitespace-nowrap">
                        {dateFormatter.format(item.createdAt)}
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-medium">{item.action}</div>

                        <div className="text-muted-foreground">{item.category}</div>
                      </td>

                      <td className="px-4 py-3">{item.outcome}</td>

                      <td className="px-4 py-3">
                        <div>{displayValue(item.actorEmail)}</div>

                        <div className="font-mono text-xs text-muted-foreground">
                          {displayValue(item.actorUserId)}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div>{displayValue(item.subjectType)}</div>

                        <div className="font-mono text-xs text-muted-foreground">
                          {displayValue(item.subjectId)}
                        </div>
                      </td>

                      <td className="px-4 py-3 font-mono text-xs">
                        {displayValue(item.ipAddress)}
                      </td>
                    </tr>
                  ))
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
