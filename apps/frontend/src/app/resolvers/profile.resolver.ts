import { Resolve } from '@angular/router';
import { AppStore } from '../store/app-store';
import { inject, Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ProfileResolver implements Resolve<void> {
  store = inject(AppStore);

  resolve() {
    const userId = this.store.user()?.id;
    if (userId) {
      this.store.loadUserDetail({ userId });
      this.store.reloadOrders({ userId });
    }
  }
}
