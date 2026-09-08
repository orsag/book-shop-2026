import { Route } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout';

const pageNotFoundRoute: Route = {
  loadComponent: () =>
    import('./pages/page-not-found/page-not-found').then((m) => m.PageNotFound),
};

export const appRoutes: Route[] = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./nx-welcome').then((m) => m.NxWelcome),
      },
      {
        path: '**',
        ...pageNotFoundRoute,
      },
    ],
  },
];