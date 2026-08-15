import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  fullyParallel: true,
  reporter: 'list',
  use: {
    // Dedicated port so e2e never latches onto another project's dev server on 4321.
    baseURL: 'http://localhost:4373',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run preview -- --port 4373',
    url: 'http://localhost:4373',
    // Locally reuse a running `npm run preview -- --port 4373` (npm.cmd detaches its child
    // on Windows, which trips Playwright's own-spawn watcher). CI (Linux) spawns cleanly.
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
