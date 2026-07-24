import { Route } from '@angular/router';
import { Dashboard } from './pages/dashboard/dashboard';
import { PageNotFound } from './pages/page-not-found/page-not-found';
import { Profile } from './pages/profile/profile';
import { Detail } from './pages/detail/detail';
import { Features } from './pages/features/features';
import { Administration } from './pages/administration/administration';
import { Shopping } from './pages/shopping/shopping';
import { Success } from './pages/success/success';
// ======================================================================
import { authGuard, adminGuard } from '@core';
import { MainLayoutComponent } from './layouts/main-layout/main-layout';
import { SimpleLayoutComponent } from './layouts/simple-layout/simple-layout';
import { LoginPage } from './pages/login/login';
import { VideosComponent } from './pages/videos/videos';

export const appRoutes: Route[] = [
  { path: 'login', component: LoginPage },
  // Routes that NEED the sidebar/filter
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        component: Dashboard,
      },
      {
        path: 'home',
        redirectTo: '',
        pathMatch: 'full',
      },
      {
        path: 'administration',
        component: Administration,
        canActivate: [adminGuard],
      },
    ],
  },
  // Routes that should be SIMPLE (No sidebar)
  {
    path: '',
    component: SimpleLayoutComponent,
    children: [
      { path: 'product/:id', component: Detail },
      {
        path: 'profile',
        component: Profile,
        canActivate: [authGuard],
      },
      { path: 'features', component: Features, canActivate: [authGuard] },
      { path: 'shopping', component: Shopping },
      { path: 'success/:id', component: Success },
      { path: 'videos', component: VideosComponent },
      { path: 'wip', component: PageNotFound },
      { path: '**', component: PageNotFound },
    ],
  },
];
