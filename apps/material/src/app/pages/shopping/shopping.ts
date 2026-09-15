import { Component, inject, OnInit, Signal } from '@angular/core';
import { CartItem } from '@store/libs';
import { Router, RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { OrderService, CreatedOrder, ToastService, ConfigurationService } from '@service';
import { ErrorCodes, ErrorService, SuccessCodes } from '@core';
import { LucideTrash2 } from '@lucide/angular';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatDivider } from '@angular/material/divider';
import { MatCard, MatCardContent } from '@angular/material/card';
import { Store } from '@ngrx/store';
import {
  CartActions,
  CartStateRoot,
  selectGrandTotal,
  selectItems,
  selectSubtotal,
  selectTax,
  selectTotalSavings,
} from '@ngrx';

@Component({
  selector: 'app-shopping',
  imports: [
    CurrencyPipe,
    LucideTrash2,
    RouterLink,
    MatButton,
    MatDivider,
    MatCard,
    MatIconButton,
    MatCardContent,
  ],
  templateUrl: './shopping.html',
  styleUrl: './shopping.css',
})
export class Shopping implements OnInit {
  config = inject(ConfigurationService);
  private orderService = inject(OrderService);
  private errorService = inject(ErrorService);
  private toast = inject(ToastService);
  private router = inject(Router);
  private readonly cartStoreRef = inject(Store<CartStateRoot>);

  items: Signal<CartItem[]> = this.cartStoreRef.selectSignal(selectItems);

  protected readonly cartStore = {
    items: this.items,
    totalSavings: this.cartStoreRef.selectSignal(selectTotalSavings),
    subtotal: this.cartStoreRef.selectSignal(selectSubtotal),
    tax: this.cartStoreRef.selectSignal(selectTax),
    grandTotal: this.cartStoreRef.selectSignal(selectGrandTotal),
    syncCartWithServer: () =>
      this.cartStoreRef.dispatch(CartActions.syncCartWithServer()),
    clearCart: () => this.cartStoreRef.dispatch(CartActions.clearCart()),
    removeItem: (productId: string) =>
      this.cartStoreRef.dispatch(CartActions.removeItem({ productId })),
    updateQuantity: (productId: string, delta: number) =>
      this.cartStoreRef.dispatch(CartActions.updateQuantity({ productId, delta })),
  };

  ngOnInit() {
    this.cartStore.syncCartWithServer();
  }

  async handleCheckout() {
    const items = this.cartStore.items().map((item) => ({
      productId: item.product.id,
      quantity: item.quantity,
    }));

    this.orderService.createOrder({ items }).subscribe({
      next: (order: CreatedOrder) => {
        this.errorService.handleSuccess(SuccessCodes.CHECKOUT);
        this.cartStore.clearCart(); // Wipe the cart logic
        this.router.navigate(['/success', order.id]);
      },
      error: () => {
        this.errorService.handleError(ErrorCodes.CHECKOUT);
      },
    });
  }

  protected handleClearCart() {
    this.cartStore.clearCart();
    this.toast.danger('Cart cleared');
  }

  protected handleRemoveItem(item: CartItem) {
    this.cartStore.removeItem(item.product.id);
    this.toast.danger('Cart item removed');
  }

  protected handleUpdateMinus(item: CartItem) {
    this.cartStore.updateQuantity(item.product.id, -1);
    this.toast.danger('Item count updated');
  }

  protected handleUpdatePlus(item: CartItem) {
    this.cartStore.updateQuantity(item.product.id, 1);
    this.toast.danger('Item count updated');
  }
}