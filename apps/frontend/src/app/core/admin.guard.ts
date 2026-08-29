import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { ToastService } from '@service';
import { UserStore } from '@store';
import { LOGGER } from './logger.token';

export const adminGuard: CanActivateFn = (
  // route: ActivatedRouteSnapshot,
  // state: RouterStateSnapshot,
) => {
  const userStore = inject(UserStore);
  const router = inject(Router);
  const toast = inject(ToastService);
  const logger = inject(LOGGER);

  // We use the computed isAdmin signal from our store
  if (userStore.isAdmin()) {
    return true;
  }

  // If not admin, redirect and notify
  toast.alert('Prístup zamietnutý');
  logger.error('Prístup zamietnutý');
  return router.parseUrl('/');
};
