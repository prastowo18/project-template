"use client";

import Link from "next/link";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type ApplicationErrorProps = {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
};

export default function ApplicationError({ error, reset }: ApplicationErrorProps) {
  useEffect(() => {
    console.error("Unhandled application error.", error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>
            <h1>Terjadi kesalahan</h1>
          </CardTitle>

          <CardDescription>
            Permintaan tidak dapat diselesaikan. Coba kembali atau kembali ke halaman utama.
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-4">
          {error.digest ? (
            <p className="font-mono text-xs text-muted-foreground">Referensi: {error.digest}</p>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={reset}>
              Coba lagi
            </Button>

            <Button variant="outline" asChild>
              <Link href="/">Halaman utama</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
