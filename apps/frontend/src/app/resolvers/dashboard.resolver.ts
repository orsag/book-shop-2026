import { Resolve } from '@angular/router';
import { AppStore } from '../store/app-store';
import { CartStore } from '../store/cart-store';
import { inject, Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DashboardResolver implements Resolve<void> {
  store = inject(AppStore);
  cart = inject(CartStore);

  resolve() {
    this.store.loadBooks();
    this.cart.syncCartWithServer();
  }
}
