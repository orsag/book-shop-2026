/// <reference types='vitest' />
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import * as http from 'node:http';

export default defineConfig(() => ({
  root: __dirname,
  cacheDir: './node_modules/.vite/book-store-2026',
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,

        // Keep-Alive ON → stabilné TCP spojenia pre Range requests
        agent: new http.Agent({
          keepAlive: true,
          maxSockets: 50,
          maxFreeSockets: 10,
        }),

        configure: (proxy) => {
          // Nechaj browser riadiť Connection header
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.removeHeader('Connection');
          });

          // Loguj len reálne chyby, nie browser cancely
          proxy.on('error', (err) => {
            if (err.name === 'ECONNRESET') return;
            console.error('Proxy error:', err);
          });
        },
      },
    },
  },
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
