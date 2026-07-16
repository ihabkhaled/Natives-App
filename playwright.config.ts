import { defineConfig, devices } from '@playwright/test';

const isCi = process.env['CI'] === 'true';
const baseURL = 'http://127.0.0.1:4173';

export default defineConfig({
  testDir: 'tests',
  fullyParallel: true,
  forbidOnly: isCi,
  retries: isCi ? 2 : 0,
  workers: isCi ? 2 : undefined,
  reporter: isCi ? [['list'], ['html', { open: 'never' }]] : [['list']],
  expect: {
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
