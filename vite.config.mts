/// <reference types='vitest' />
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig(() => ({
  root: __dirname,
  cacheDir: './node_modules/.vite/book-store-2026',
  plugins: [
    tsconfigPaths(),
    viteStaticCopy({
      targets: [
        {
          src: '*.md',
          dest: '.',
        },
      ],
    }),
  ],
  // Uncomment this if you are using workers.
  // worker: {
  //   plugins: () => [ nxViteTsPaths() ],
  // },
  test: {
    name: 'book-store-2026',
    watch: false,
    globals: true,
    environment: 'jsdom',
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      'apps/backend/**',
      'apps/backend-e2e/**',
    ],
    reporters: ['default'],
    coverage: {
      reportsDirectory: './coverage/book-store-2026',
      provider: 'v8' as const,
    },
  },
}));
