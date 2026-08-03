"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth-client";

export function LogoutButton() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function handleLogout() {
    if (isPending) {
      return;
    }

    setIsPending(true);

    try {
      const result = await authClient.signOut();

      if (result.error) {
        toast.error("Logout gagal", {
          description: "Sesi tidak dapat dihentikan. Silakan coba kembali.",
        });

        return;
      }

      router.replace("/login");
      router.refresh();
    } catch {
      toast.error("Logout gagal", {
        description: "Terjadi kesalahan saat menghentikan sesi.",
      });
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleLogout}
      disabled={isPending}
      aria-busy={isPending}
    >
      {isPending ? (
        <>
          <Spinner />
          Keluar...
        </>
      ) : (
        <>
          <LogOut />
          Keluar
        </>
      )}
    </Button>
  );
}
