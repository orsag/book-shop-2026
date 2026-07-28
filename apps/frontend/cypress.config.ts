import { nxE2EPreset } from '@nx/cypress/plugins/cypress-preset';
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    ...nxE2EPreset(__filename, {
      cypressDir: 'cypress',
      bundler: 'vite',
      webServerCommands: {
        default: 'nx run frontend:serve',
        production: 'nx run frontend:serve:production',
      },
      ciWebServerCommand: 'nx run frontend:serve-static',
    }),
    video: false,
    specPattern: 'cypress/**/*.cy.{js,jsx,ts,tsx}',
    baseUrl: 'http://localhost:4200',
    allowCypressEnv: false,
    // ⚡ Inject Node's process.env variables into Cypress env object
    env: {
      USERNAME: process.env['USERNAME'] || 'bossmann',
      PASSWORD: process.env['PASSWORD'] || 'admin12345',
    },
  },
  expose: {
    environment: process.env['NODE_ENV'] || 'staging',
  },
});
