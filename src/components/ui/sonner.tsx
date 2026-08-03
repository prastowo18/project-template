"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

function Toaster({ theme: requestedTheme, ...props }: ToasterProps) {
  const { resolvedTheme } = useTheme();

  const theme: NonNullable<ToasterProps["theme"]> =
    requestedTheme ??
    (resolvedTheme === "light" || resolvedTheme === "dark" ? resolvedTheme : "system");

  return (
    <Sonner
      {...props}
      theme={theme}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
    />
  );
}

export { Toaster };
