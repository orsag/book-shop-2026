const { nxE2EPreset } = require('@nx/cypress/plugins/cypress-preset');
const { defineConfig } = require('cypress');
import { fileURLToPath } from 'url';

// @ts-ignore
const __filename: string = fileURLToPath(import.meta.url);
const prodRun = 'nx run backend:serve:production';

const nodeEnv = process.env['NODE_ENV'] || 'development';
const prod = nodeEnv === 'production';
const BASE_URL = prod ? 'http://127.0.0.1:3000' : 'http://localhost:3000';

module.exports = defineConfig({
  e2e: {
    ...nxE2EPreset(__filename, {
      cypressDir: 'cypress',
      bundler: 'vite',
      webServerCommands: {
        // default: prodRun,
        // production: prodRun,
        default: prod ? prodRun : 'nx run backend:serve',
        production: prod ? prodRun : 'nx run backend:serve:production',
      },
      ciWebServerCommand: 'echo "Server managed externally by CI script"',
    }),
    baseUrl: BASE_URL,
    specPattern: 'cypress/**/*.cy.{js,jsx,ts,tsx}',
    video: false,
    env: {
      TEST_NAME: process.env['TEST_NAME'] || 'testinguser',
      TEST_PASSWORD: process.env['TEST_PASSWORD'] || 'tester12345',
      NODE_ENV: process.env['NODE_ENV'] || 'production',
      BASE_URL: BASE_URL,
    },
  },
});
