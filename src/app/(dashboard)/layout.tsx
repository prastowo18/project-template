import { Home, ScrollText, ShieldCheck, Users } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { type PermissionKey, PERMISSIONS } from "@/authorization";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/features/auth";
import { getCurrentSession, requirePermission } from "@/server/authorization";

type DashboardLayoutProps = Readonly<{
  children: ReactNode;
}>;

function hasStatusCode(error: unknown, expectedStatusCode: number) {
  if (!error || typeof error !== "object" || !("statusCode" in error)) {
    return false;
  }

  return error.statusCode === expectedStatusCode;
}

async function canUsePermission(permission: PermissionKey) {
  try {
    await requirePermission({
      permission,
    });

    return true;
  } catch (error) {
    if (hasStatusCode(error, 403)) {
      return false;
    }

    throw error;
  }
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  const [showUserNavigation, showRoleNavigation, showAuditLogNavigation] = await Promise.all([
    canUsePermission(PERMISSIONS.USER_READ),
    canUsePermission(PERMISSIONS.ROLE_READ),
    canUsePermission(PERMISSIONS.AUDIT_READ),
  ]);

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="mx-auto grid max-w-7xl gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex min-h-12 items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="truncate font-semibold">Next.js Standard Template</p>

              <p className="truncate text-sm text-muted-foreground">
                {session.user.name} · {session.user.email}
              </p>
            </div>

            <LogoutButton />
          </div>

          <nav aria-label="Navigasi aplikasi" className="flex flex-wrap items-center gap-1">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <Home />
                Dashboard
              </Link>
            </Button>

            {showUserNavigation ? (
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/users">
                  <Users />
                  Pengguna
                </Link>
              </Button>
            ) : null}

            {showRoleNavigation ? (
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/roles">
                  <ShieldCheck />
                  Role
                </Link>
              </Button>
            ) : null}

            {showAuditLogNavigation ? (
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/audit-logs">
                  <ScrollText />
                  Audit Log
                </Link>
              </Button>
            ) : null}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
