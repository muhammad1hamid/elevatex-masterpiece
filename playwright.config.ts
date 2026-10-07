import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: Boolean(process.env['CI']),
  failOnFlakyTests: Boolean(process.env['CI']),
  retries: process.env['CI'] ? 1 : 0,
  workers: 2,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { baseURL: 'http://127.0.0.1:4321', trace: 'retain-on-failure' },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        ...(process.env['PLAYWRIGHT_CHANNEL']
          ? { channel: process.env['PLAYWRIGHT_CHANNEL'] }
          : {}),
      },
    },
  ],
  webServer: {
    command: 'npm run preview -- --port 4321',
    url: 'http://127.0.0.1:4321',
    reuseExistingServer: false,
    timeout: 60000,
  },
});
