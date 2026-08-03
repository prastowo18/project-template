import { spawn } from "node:child_process";

const pnpmCommand = process.platform === "win32" ? "pnpm.cmd" : "pnpm";

const child = spawn(pnpmCommand, ["exec", "playwright", "test", "tests/e2e/auth.spec.ts"], {
  stdio: "inherit",

  env: {
    ...process.env,

    PUBLIC_REGISTRATION_ENABLED: "true",
  },
});

child.on("error", (error) => {
  console.error("Gagal menjalankan Playwright:", error);

  process.exit(1);
});

child.on("exit", (code, signal) => {
  if (signal) {
    console.error(`Playwright dihentikan oleh signal ${signal}.`);

    process.exit(1);
  }

  process.exit(code ?? 1);
});
