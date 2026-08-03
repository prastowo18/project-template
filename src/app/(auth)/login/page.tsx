import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoginForm } from "@/features/auth";
import { getCurrentSession } from "@/server/authorization";

export const metadata: Metadata = {
  title: "Login",
  description: "Masuk ke aplikasi.",
};

export default async function LoginPage() {
  const session = await getCurrentSession();

  if (session) {
    redirect("/");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Masuk</CardTitle>
        <CardDescription>Masukkan email dan password untuk melanjutkan.</CardDescription>
      </CardHeader>

      <CardContent>
        <LoginForm />
      </CardContent>

      <CardFooter className="justify-center text-sm">
        Belum memiliki akun?{" "}
        <Link href="/register" className="font-medium underline-offset-4 hover:underline">
          Daftar
        </Link>
      </CardFooter>
    </Card>
  );
}
