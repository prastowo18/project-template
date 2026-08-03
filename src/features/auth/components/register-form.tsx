"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  type RegisterFormData,
  type RegisterFormInput,
  registerSchema,
} from "@/features/auth/schemas";
import { authClient } from "@/lib/auth-client";

export function RegisterForm() {
  const router = useRouter();

  const form = useForm<RegisterFormInput, unknown, RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      passwordConfirmation: "",
      acceptTerms: false,
    },
  });

  async function onSubmit(data: RegisterFormData) {
    try {
      const result = await authClient.signUp.email({
        name: data.name,
        email: data.email,
        password: data.password,
      });

      if (result.error) {
        toast.error("Registrasi gagal", {
          description: "Akun tidak dapat dibuat. Periksa kembali data atau gunakan email lain.",
        });

        return;
      }

      toast.success("Registrasi berhasil", {
        description: "Akun anda telah dibuat.",
      });

      router.replace("/");
      router.refresh();
    } catch {
      toast.error("Registrasi gagal", {
        description: "Terjadi kesalahan saat membuat akun.",
      });
    }
  }

  return (
    <form noValidate onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Nama</FieldLabel>

              <Input
                {...field}
                id={field.name}
                type="text"
                autoComplete="name"
                placeholder="Nama lengkap"
                aria-invalid={fieldState.invalid}
                disabled={form.formState.isSubmitting}
              />

              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Email</FieldLabel>

              <Input
                {...field}
                id={field.name}
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="nama@example.com"
                aria-invalid={fieldState.invalid}
                disabled={form.formState.isSubmitting}
              />

              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Password</FieldLabel>

              <Input
                {...field}
                id={field.name}
                type="password"
                autoComplete="new-password"
                placeholder="Minimal 12 karakter"
                aria-invalid={fieldState.invalid}
                disabled={form.formState.isSubmitting}
              />

              <FieldDescription>Gunakan minimal 12 karakter.</FieldDescription>

              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="passwordConfirmation"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Konfirmasi password</FieldLabel>

              <Input
                {...field}
                id={field.name}
                type="password"
                autoComplete="new-password"
                placeholder="Ulangi password"
                aria-invalid={fieldState.invalid}
                disabled={form.formState.isSubmitting}
              />

              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="acceptTerms"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field orientation="horizontal" data-invalid={fieldState.invalid}>
              <Checkbox
                id={field.name}
                checked={field.value}
                onCheckedChange={(checked) => {
                  field.onChange(checked === true);
                }}
                aria-invalid={fieldState.invalid}
                disabled={form.formState.isSubmitting}
              />

              <div className="grid gap-1">
                <FieldLabel htmlFor={field.name}>Saya menyetujui syarat dan ketentuan</FieldLabel>

                <FieldDescription>Persetujuan diperlukan untuk membuat akun.</FieldDescription>

                {fieldState.error && <FieldError errors={[fieldState.error]} />}
              </div>
            </Field>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={form.formState.isSubmitting}
          aria-busy={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? (
            <>
              <Spinner />
              Membuat akun...
            </>
          ) : (
            "Daftar"
          )}
        </Button>
      </FieldGroup>
    </form>
  );
}
