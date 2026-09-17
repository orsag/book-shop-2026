import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { Store } from '@ngrx/store';
import { ToastService } from '@service';
import { LOGGER } from '@core';
import { AppStateRoot, selectIsAdmin, UserStateRoot } from '@ngrx';

export const adminGuard: CanActivateFn = () => {
  const store = inject(Store<AppStateRoot & UserStateRoot>);
  const router = inject(Router);
  const toast = inject(ToastService);
  const logger = inject(LOGGER);

  if (store.selectSignal(selectIsAdmin)()) {
    return true;
  }

  toast.alert('Prístup zamietnutý');
  logger.error('Prístup zamietnutý');
  return router.parseUrl('/');
};