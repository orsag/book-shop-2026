import { defineConfig } from 'orval';

export default defineConfig({
  api: {
    input: {
      target: 'http://localhost:3000/api-docs-json',
    },
    output: {
      // Change client to 'no-client' so it ignores generating HTTP services
      client: undefined,
      target: 'apps/libs/src/api-interfaces/src/generated/models',
      schemas: 'apps/libs/src/api-interfaces/generated/models',
      clean: true,
    },
  },
});
