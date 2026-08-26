/**
 * Production configuration (default build).
 * Empty base URLs = same-origin: the reverse proxy in front of the app
 * serves both /api and backend-hosted media from the same domain.
 */
export const environment = {
  production: true,
  /** Absolute prefix for /api calls ('' = same origin). */
  apiBaseUrl: '',
  /** Absolute prefix for backend-served files (covers, uploads) ('' = same origin). */
  mediaBaseUrl: '',
} as const;
