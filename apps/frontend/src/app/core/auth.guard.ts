import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { ToastService } from '@service';
import { UserStore } from '@store';

export const authGuard: CanActivateFn = () => {
  const userStore = inject(UserStore);
  const router = inject(Router);
  const toast = inject(ToastService);

  // We use the computed isAdmin signal from our store
  if (userStore.isLoggedIn()) {
    return true;
  }

  // If not admin, redirect and notify
  toast.alert('Prístup zamietnutý');
  return router.parseUrl('/');
};
