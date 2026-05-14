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
import { authGuard } from './core/auth.guard';
import { adminGuard } from './core/admin.guard';
import { MainLayoutComponent } from './layouts/main-layout/main-layout';
import { SimpleLayoutComponent } from './layouts/simple-layout/simple-layout';
import { LoginPage } from './pages/login/login';
import { DashboardResolver } from './resolvers/dashboard.resolver';
import { AdministrationResolver } from './resolvers/administration.resolver';
import { ProfileResolver } from './resolvers/profile.resolver';

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
        resolve: { initialData: DashboardResolver },
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
        resolve: { initialData: AdministrationResolver },
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
        resolve: { initialData: ProfileResolver },
      },
      { path: 'features', component: Features, canActivate: [authGuard] },
      { path: 'shopping', component: Shopping },
      { path: 'success/:id', component: Success },
      { path: 'wip', component: PageNotFound },
      { path: '**', component: PageNotFound },
    ],
  },
];
