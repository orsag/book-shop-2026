import { Component, inject, OnInit, Signal } from '@angular/core';
import { CartItem, CartStore } from '../../store/cart-store';
import { Router, RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { OrderService, CreatedOrder } from '../../services/order-service';
import {
  ErrorCodes,
  ErrorHandlerService,
  SuccessCodes,
} from '../../core/error.handler';
import { LucideTrash2 } from '@lucide/angular';

@Component({
  selector: 'app-shopping',
  imports: [CurrencyPipe, LucideTrash2, RouterLink],
  templateUrl: './shopping.html',
  styleUrl: './shopping.css',
})
export class Shopping implements OnInit {
  protected cartStore = inject(CartStore);
  private orderService = inject(OrderService);
  private errorService = inject(ErrorHandlerService);
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
}
