import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for Vanduo Docs
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
    ...(process.env.CI ? [['junit', { outputFile: 'test-results/junit.xml' }] as const] : []),
  ],
  use: {
    baseURL: 'http://localhost:8787',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'Chromium Desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
      },
    },
    {
      name: 'Firefox Desktop',
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 1920, height: 1080 },
      },
    },
    {
      name: 'WebKit Desktop',
      use: {
        ...devices['Desktop Safari'],
        viewport: { width: 1920, height: 1080 },
      },
    },
    {
      name: 'Chromium Mobile',
      use: { ...devices['Pixel 7'] },
    },
    {
      name: 'WebKit Mobile',
      use: { ...devices['iPhone 14'] },
    },
    {
      name: 'Chromium Tablet',
      use: { ...devices['iPad Pro 11'] },
    },
    {
      name: 'WebKit Tablet',
      use: { ...devices['iPad Pro 11'] },
    },
  ],
  webServer: {
    command: 'python3 -m http.server 8787 --directory .',
    url: 'http://localhost:8787',
    reuseExistingServer: !process.env.CI,
    timeout: 10 * 1000,
  },
});
