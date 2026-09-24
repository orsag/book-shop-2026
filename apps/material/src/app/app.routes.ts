import { Route } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout';
import { SimpleLayoutComponent } from './layouts/simple-layout/simple-layout';
import { Login as LoginPage } from '../app/pages/login/login';
import { adminGuard } from './guards/admin.guard';
import { profileGuard } from './guards/profile.guard';

const pageNotFoundRoute: Route = {
  loadComponent: () =>
    import('./pages/page-not-found/page-not-found').then((m) => m.PageNotFound),
};

export const appRoutes: Route[] = [
  { path: 'login', component: LoginPage },
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
        path: 'shopping',
        loadComponent: () =>
          import('./pages/shopping/shopping').then((m) => m.Shopping),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./pages/profile/profile').then((m) => m.Profile),
        canDeactivate: [profileGuard],
      },
      {
        path: 'success/:id',
        loadComponent: () =>
          import('./pages/success/success').then((m) => m.Success),
      },
      {
        path: '**',
        ...pageNotFoundRoute,
      },
    ],
  },
];
