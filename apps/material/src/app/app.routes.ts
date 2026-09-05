import { Route } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout';

const pageNotFoundRoute: Route = {
  loadComponent: () =>
    import('./pages/page-not-found/page-not-found').then((m) => m.PageNotFound),
};

export const appRoutes: Route[] = [
  {
    path: '',
    loadComponent: () => import('./nx-welcome').then((m) => m.NxWelcome),
  },
  // Routes that NEED the sidebar
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '**',
        ...pageNotFoundRoute,
      },
    ],
  },
];