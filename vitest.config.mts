import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./", import.meta.url)) },
  },
  test: {
    // Unit tests run in Node; component tests opt into jsdom with a
    // `@vitest-environment jsdom` comment. Playwright specs live in tests/e2e.
    include: ["tests/**/*.test.{ts,tsx}"],
    exclude: ["tests/e2e/**", "node_modules/**"],
    environment: "node",
    setupFiles: ["tests/setup.ts"],
  },
});
