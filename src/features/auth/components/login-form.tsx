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
import { type LoginFormData, type LoginFormInput, loginSchema } from "@/features/auth/schemas";
import { authClient } from "@/lib/auth-client";

export function LoginForm() {
  const router = useRouter();

  const form = useForm<LoginFormInput, unknown, LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: true,
    },
  });

  async function onSubmit(data: LoginFormData) {
    const result = await authClient.signIn.email({
      email: data.email,
      password: data.password,
      rememberMe: data.rememberMe,
    });

    if (result.error) {
      toast.error("Login gagal", {
        description: "Email atau password yang dimasukkan tidak valid.",
      });

      return;
    }

    toast.success("Login berhasil.");

    router.replace("/");
    router.refresh();
  }

  return (
    <form noValidate onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
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
                autoComplete="current-password"
                placeholder="Masukkan password"
                aria-invalid={fieldState.invalid}
                disabled={form.formState.isSubmitting}
              />

              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="rememberMe"
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
                <FieldLabel htmlFor={field.name}>Ingat saya</FieldLabel>

                <FieldDescription>Pertahankan sesi login pada perangkat ini.</FieldDescription>

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
              Memproses...
            </>
          ) : (
            "Masuk"
          )}
        </Button>
      </FieldGroup>
    </form>
  );
}
