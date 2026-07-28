import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // {
  //   path: '', // ✅ Empty string for the root route '/'
  //   renderMode: RenderMode.Server,
  // },
  // {
  //   path: 'home', // ✅ No leading slash
  //   renderMode: RenderMode.Server,
  // },
  {
    path: '**', // ✅ Fallback for all other routes
    renderMode: RenderMode.Client,
  },
];
