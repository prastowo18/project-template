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
import { env } from "@/env/server";
import { RegisterForm } from "@/features/auth";
import { getCurrentSession } from "@/server/authorization";

export const metadata: Metadata = {
  title: "Registrasi",
  description: "Buat akun aplikasi.",
};

export default async function RegisterPage() {
  if (!env.PUBLIC_REGISTRATION_ENABLED) {
    redirect("/login");
  }

  const session = await getCurrentSession();

  if (session) {
    redirect("/");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h1>Buat akun</h1>
        </CardTitle>

        <CardDescription>Lengkapi data untuk membuat akun baru.</CardDescription>
      </CardHeader>

      <CardContent>
        <RegisterForm />
      </CardContent>

      <CardFooter className="justify-center text-sm">
        Sudah memiliki akun?{" "}
        <Link href="/login" className="font-medium underline-offset-4 hover:underline">
          Masuk
        </Link>
      </CardFooter>
    </Card>
  );
}
