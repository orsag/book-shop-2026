import { nxE2EPreset } from '@nx/cypress/plugins/cypress-preset';
import { defineConfig } from 'cypress';
// 'nx run frontend:serve-static',

const proxyCommand = 'node proxy-server.js';

const nodeEnv =
  process.env['NODE_ENV'] || 'development';
const prod = nodeEnv === 'production';
const BASE_URL = prod ? 'http://127.0.0.1:4200' : 'http://localhost:4200';

export default defineConfig({
  e2e: {
    ...nxE2EPreset(__filename, {
      cypressDir: 'cypress',
      bundler: 'vite',
      webServerCommands: {
        default: prod ? proxyCommand : 'nx run frontend:serve',
        production: prod ? proxyCommand : 'nx run frontend:serve:production',
      },
      ciWebServerCommand: prod ? proxyCommand : 'nx run frontend:serve',
    }),
    video: false,
    defaultCommandTimeout: 10000,
    specPattern: 'cypress/**/*.cy.{js,jsx,ts,tsx}',
    allowCypressEnv: false,
    baseUrl: BASE_URL,
    env: {
      USERNAME: process.env['USERNAME'] || 'bossmann',
      PASSWORD: process.env['PASSWORD'] || 'admin12345',
      NODE_ENV: process.env['NODE_ENV'] || 'production',
      BASE_URL: BASE_URL,
    },
  },
});
