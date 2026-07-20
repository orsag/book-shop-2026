/// <reference types="node" />
import { defineConfig, devices } from '@playwright/test';
import { nxE2EPreset } from '@nx/playwright/preset';
import { workspaceRoot } from '@nx/devkit';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';
import path from 'path';
import 'dotenv/config';

// Safe standard fallback computation for __dirname / import.meta.dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const currentDirname = dirname(__filename);

// Explicitly reading from globalThis to satisfy strict isolated compilers
const env = (globalThis as any).process?.env || {};
dotenv.config({ path: path.resolve(__dirname, '../.env') });
const baseURL = env['BASE_URL'] || 'http://localhost:4200';

export default defineConfig({
  ...nxE2EPreset(currentDirname, { testDir: './e2e' }),
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    baseURL,
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    actionTimeout: 35 * 1000,
  },
  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npx nx serve frontend',
    url: 'http://localhost:4200',
    reuseExistingServer: true,
    cwd: workspaceRoot,
  },
  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: './e2e/.auth.json',
      },
      dependencies: ['setup'],
    },
  ],
});
