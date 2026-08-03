import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>
            <h1>Halaman tidak ditemukan</h1>
          </CardTitle>

          <CardDescription>
            Alamat yang anda buka tidak tersedia, sudah dipindahkan, atau telah dihapus.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Button asChild>
            <Link href="/">Kembali ke halaman utama</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
