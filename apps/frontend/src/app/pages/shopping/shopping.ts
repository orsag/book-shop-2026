import { Component, HostListener, inject, OnInit, Signal } from '@angular/core';
import { CartStore } from '@store';
import { CartItem } from '@store/libs';
import { Router, RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { OrderService, CreatedOrder, ToastService } from '@service';
import {
  ErrorCodes,
  ErrorService,
  SuccessCodes,
  RedFocusDirective,
} from '@core';
import { LucideTrash2 } from '@lucide/angular';

@Component({
  selector: 'app-shopping',
  imports: [CurrencyPipe, LucideTrash2, RouterLink, RedFocusDirective],
  templateUrl: './shopping.html',
  styleUrl: './shopping.css',
})
export class Shopping implements OnInit {
  protected cartStore = inject(CartStore);
  private orderService = inject(OrderService);
  private errorService = inject(ErrorService);
  private toast = inject(ToastService);
  private router = inject(Router);

  items: Signal<CartItem[]> = this.cartStore.items;

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

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      const target = event.target as HTMLElement;

      // Check if the event happened inside a collapse item specific to this component
      const collapseItem = target.closest('.collapse');
      if (collapseItem) {
        event.preventDefault(); // Prevent default page scroll on Space

        const radioInput = collapseItem.querySelector(
          'input[type="radio"]',
        ) as HTMLInputElement;

        if (radioInput) {
          radioInput.checked = true;
          // Dispatch change event so Angular/DaisyUI picks up the state change
          radioInput.dispatchEvent(new Event('change'));
        }
      }
    }
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
