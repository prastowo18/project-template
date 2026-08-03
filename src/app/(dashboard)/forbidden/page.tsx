import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Akses Ditolak",
  description: "Pengguna tidak memiliki izin untuk mengakses halaman ini.",
};

export default function ForbiddenPage() {
  return (
    <div className="mx-auto max-w-xl py-10">
      <Card>
        <CardHeader>
          <CardTitle>
            <h1>Akses ditolak</h1>
          </CardTitle>

          <CardDescription>
            Akun anda tidak memiliki permission yang diperlukan untuk membuka halaman tersebut.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Button asChild>
            <Link href="/">Kembali ke dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
