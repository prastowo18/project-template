import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { Separator } from "@/components/ui/separator";
import { LogoutButton } from "@/features/auth";
import { getCurrentSession } from "@/server/authorization";

type DashboardLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="min-w-0">
            <p className="truncate font-semibold">Next.js Standard Template</p>

            <p className="truncate text-sm text-muted-foreground">
              {session.user.name} · {session.user.email}
            </p>
          </div>

          <LogoutButton />
        </div>
      </header>

      <Separator />

      <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
