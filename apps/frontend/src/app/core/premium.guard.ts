import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AppStore } from '../store/app-store'; // Adjust path to your store

export const premiumGuard: CanActivateFn = (route, state) => {
  const store = inject(AppStore);
  const router = inject(Router);

  // Access the signal value from your store
  const isPremium = store.premiumStatus()?.isPremium ?? false;

  if (isPremium) {
    return true;
  }

  // Redirect if not premium (e.g., to a landing page or upgrade modal)
  return router.parseUrl('/features?upgrade=true');
};
