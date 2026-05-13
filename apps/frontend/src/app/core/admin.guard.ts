import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AppStore } from '../store/app-store'; // adjust path as needed
import { ToastService } from '../services/toast-service';

export const adminGuard: CanActivateFn = () => {
  const store = inject(AppStore);
  const router = inject(Router);
  const toast = inject(ToastService);

  // We use the computed isAdmin signal from our store
  if (store.isAdmin()) {
    return true;
  }

  // If not admin, redirect and notify
  toast.alert('Prístup zamietnutý');
  return router.parseUrl('/');
};
