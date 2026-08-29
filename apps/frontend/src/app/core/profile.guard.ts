import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import type { Profile } from '../pages/profile/profile';
import { ToastService } from '@service';
import { UserStore } from '@store';
import { LOGGER } from './logger.token';

export const profileGuard: CanDeactivateFn<Profile> = () => {
  const userStore = inject(UserStore);
  const toast = inject(ToastService);
  const logger = inject(LOGGER);

  if (userStore.isDirtyForm()) {
    toast.alert('Form obsahuje zmeny');
    logger.error('Form obsahuje zmeny');
    return false;
  }

  return true;
};
