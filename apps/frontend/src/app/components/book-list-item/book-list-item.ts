import { Component, inject, Input, signal } from '@angular/core';
import { Product } from '@store/shared-models';
import { CurrencyPipe, NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartStore } from '../../store/cart-store';
import { TranslocoDirective } from '@jsverse/transloco';
import { UXService } from '@service';
import { OverlayComponent } from '../common/overlay.component';

@Component({
  selector: 'app-book-list-item',
  imports: [
    NgOptimizedImage,
    RouterLink,
    CurrencyPipe,
    TranslocoDirective,
    OverlayComponent,
  ],
  templateUrl: './book-list-item.html',
  styleUrl: './book-list-item.css',
})
export class BookListItem {
  cartStore = inject(CartStore);
  ux = inject(UXService);
  isHovered = signal(false);
  @Input({ required: true }) product!: Product;

  handleCartAction() {
    if (this.ux.isInCart(this.product)) {
      // If it's there, remove it
      this.cartStore.removeItem(this.product.id);
    } else if (this.product.availableCount > 0) {
      // If it's not, add it
      this.cartStore.addToCart(this.product);
    }
  }
}
