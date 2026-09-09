import { Route } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout';
import { SimpleLayoutComponent } from './layouts/simple-layout/simple-layout';

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
        loadComponent: () =>
          import('./pages/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'home',
        redirectTo: '',
        pathMatch: 'full',
      },
      // {
      //   path: '',
      //   loadComponent: () => import('./nx-welcome').then((m) => m.NxWelcome),
      // },
    ],
  },
  {
    path: '',
    component: SimpleLayoutComponent,
    children: [
      {
        path: 'product/:id',
        loadComponent: () =>
          import('./pages/detail/detail').then((m) => m.Detail),
      },
      {
        path: '**',
        ...pageNotFoundRoute,
      },
    ],
  },
];