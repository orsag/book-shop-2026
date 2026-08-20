import { authGuard, adminGuard } from '@core';
import { Route } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout';
import { SimpleLayoutComponent } from './layouts/simple-layout/simple-layout';
import { LoginPage } from './pages/login/login';

const pageNotFoundRoute: Route = {
  loadComponent: () =>
    import('./pages/page-not-found/page-not-found').then(
      (m) => m.PageNotFound,
    ),
};

export const appRoutes: Route[] = [
  { path: 'login', component: LoginPage },
  // Routes that NEED the sidebar/filter
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
      {
        path: 'administration',
        loadComponent: () =>
          import('./pages/administration/administration').then(
            (m) => m.Administration,
          ),
        canActivate: [adminGuard],
      },
    ],
  },

  // Routes that should be SIMPLE (No sidebar)
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
        path: 'profile',
        loadComponent: () =>
          import('./pages/profile/profile').then((m) => m.Profile),
        canActivate: [authGuard],
      },
      {
        path: 'features',
        loadComponent: () =>
          import('./pages/features/features').then((m) => m.Features),
        canActivate: [authGuard],
      },
      {
        path: 'shopping',
        loadComponent: () =>
          import('./pages/shopping/shopping').then((m) => m.Shopping),
      },
      {
        path: 'success/:id',
        loadComponent: () =>
          import('./pages/success/success').then((m) => m.Success),
      },
      {
        path: 'videos',
        loadComponent: () =>
          import('./pages/videos/videos').then((m) => m.VideosComponent),
      },
      {
        path: 'wip',
        ...pageNotFoundRoute,
      },
      {
        path: 'license',
        loadComponent: () =>
          import('./pages/license/license').then((m) => m.License),
      },
      {
        path: '**',
        ...pageNotFoundRoute,
      },
    ],
  },
];
