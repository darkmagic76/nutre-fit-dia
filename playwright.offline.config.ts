import { defineConfig, devices } from '@playwright/test';

/**
 * Offline cold-start suite.
 *
 * Needs a production build: `vite-plugin-pwa` emits the service worker only
 * from `vite build`, and `vite preview` serves it under the deployment base
 * path. The default dev-server config cannot exercise this path.
 */
export default defineConfig({
  testDir: './e2e',
  testMatch: /offline\.spec\.ts/,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:4173/nutre-fit-dia/',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'pnpm build && pnpm preview --port 4173 --strictPort',
    url: 'http://localhost:4173/nutre-fit-dia/',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
