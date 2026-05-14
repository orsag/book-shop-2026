import { Resolve } from '@angular/router';
import { AppStore } from '../store/app-store';
import { CartStore } from '../store/cart-store';
import { inject, Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AdministrationResolver implements Resolve<void> {
  store = inject(AppStore);
  cart = inject(CartStore);

  resolve() {
    if (this.store.totalProducts() === 0) {
      this.store.loadBooks();
    }
    if (this.store.isAdmin()) {
      const userId = this.store.user()?.id;
      if (userId) {
        this.store.reloadOrders({ userId });
      }
    }
  }
}
