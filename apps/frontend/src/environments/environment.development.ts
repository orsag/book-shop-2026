/**
 * Development configuration - swapped in via `fileReplacements`
 * when building/serving with the development configuration.
 */
export const environment = {
  production: false,
  /** NestJS dev server (also the target of proxy.conf.js). */
  apiBaseUrl: 'http://localhost:3000',
  /** Cover images/uploads are served straight from the backend in dev. */
  mediaBaseUrl: 'http://localhost:3000',
} as const;
