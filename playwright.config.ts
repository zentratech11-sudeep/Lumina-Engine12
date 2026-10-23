import { defineConfig, devices } from "@playwright/test";

const PORT = 3401;
const baseURL = `http://localhost:${PORT}`;

/**
 * End-to-end tests (TRD §40) against a production build.
 * WebGL runs on SwiftShader so the 3D scene renders on machines without a GPU (CI).
 */
export default defineConfig({
  testDir: "tests/e2e",
  timeout: 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL,
    trace: "retain-on-failure",
    launchOptions: { args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] },
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } }, testIgnore: /mobile\.spec\.ts/ },
    { name: "mobile", use: { ...devices["Pixel 7"] }, testMatch: /mobile\.spec\.ts/ },
  ],
  webServer: {
    command: `npm run build && npm run start -- -p ${PORT}`,
    url: baseURL,
    timeout: 240_000,
    reuseExistingServer: !process.env.CI,
    env: {
      NEXT_PUBLIC_SITE_URL: baseURL,
      NEXT_TELEMETRY_DISABLED: "1",
      // Contact form logs instead of emailing during tests.
      CONTACT_DRY_RUN: "1",
    },
  },
});
