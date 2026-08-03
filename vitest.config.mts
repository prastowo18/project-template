import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],

  resolve: {
    tsconfigPaths: true,
  },

  test: {
    environment: "jsdom",
    globals: false,
    setupFiles: ["./tests/setup.ts"],

    // Playwright E2E tests dijalankan oleh Playwright,
    // bukan oleh Vitest.
    include: ["tests/unit/**/*.{test,spec}.{ts,tsx}"],

    exclude: ["tests/e2e/**", "node_modules/**", ".next/**"],

    clearMocks: true,
    mockReset: true,
    restoreMocks: true,
  },
});
