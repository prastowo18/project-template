import type { Metadata } from "next";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Halaman utama aplikasi.",
};

export default function DashboardPage() {
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>

        <p className="mt-1 text-muted-foreground">
          Area ini hanya dapat diakses oleh pengguna yang sudah login.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fondasi project aktif</CardTitle>

          <CardDescription>
            Authentication, database, dan authorization dasar sudah tersedia.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <p className="text-sm">
            Modul aplikasi berikutnya dapat ditempatkan di dalam route group dashboard ini.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
