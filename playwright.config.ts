import { defineConfig, devices } from '@playwright/test';

const isCi = process.env['CI'] === 'true';
const baseURL = 'http://127.0.0.1:4173';

export default defineConfig({
  testDir: 'tests',
  fullyParallel: true,
  forbidOnly: isCi,
  retries: isCi ? 2 : 0,
  // Every worker drives its own browser against one shared dev server. Letting
  // Playwright scale to the core count starves that server on a many-core
  // machine, so boot exceeds the expect timeout even though nothing is wrong.
  // Bounding the pool keeps the local run both representative of CI and faster.
  workers: isCi ? 2 : 4,
  reporter: isCi ? [['list'], ['html', { open: 'never' }]] : [['list']],
  expect: {
    // Full-page capture of a dozen screens in parallel starves the renderer on
    // a loaded machine; the assertion still has to pass, it just gets to wait.
    timeout: 15_000,
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.02,
      animations: 'disabled',
    },
  },
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'e2e-desktop-en',
      testDir: 'tests/e2e',
      use: { ...devices['Desktop Chrome'], locale: 'en-US' },
    },
    {
      name: 'e2e-mobile-en',
      testDir: 'tests/e2e',
      use: { ...devices['Pixel 7'], locale: 'en-US' },
    },
    {
      name: 'e2e-desktop-ar',
      testDir: 'tests/e2e',
      grep: /@rtl/,
      use: { ...devices['Desktop Chrome'], locale: 'ar' },
    },
    {
      name: 'accessibility',
      testDir: 'tests/accessibility',
      use: { ...devices['Desktop Chrome'], locale: 'en-US' },
    },
    {
      name: 'visual',
      testDir: 'tests/visual',
      use: { ...devices['Desktop Chrome'], locale: 'en-US' },
    },
    {
      // Design evidence, not a gate: writes the review gallery frames.
      name: 'design-capture',
      testDir: 'tests/design',
      use: { ...devices['Desktop Chrome'], locale: 'en-US' },
    },
  ],
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 4173 --strictPort',
    url: baseURL,
    reuseExistingServer: !isCi,
    stdout: 'ignore',
    stderr: 'pipe',
    timeout: 120_000,
    env: {
      VITE_API_MODE: 'mock',
      VITE_ENABLE_QUERY_DEVTOOLS: 'false',
    },
  },
});
