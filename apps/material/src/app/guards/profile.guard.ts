import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppStateRoot, selectIsDirtyForm, UserStateRoot } from '@ngrx';

export const profileGuard: CanDeactivateFn<unknown> = () => {
  const store = inject(Store<AppStateRoot & UserStateRoot>);

  return !store.selectSignal(selectIsDirtyForm)();
};
