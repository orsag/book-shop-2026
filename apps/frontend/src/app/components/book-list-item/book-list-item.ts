import { Component, inject, Input, OnInit } from '@angular/core';
import { Product } from '@store/shared-models';
import { CurrencyPipe, NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartStore } from '../../store/cart-store';
import { TranslocoDirective } from '@jsverse/transloco';
import { UXService } from '../../services/ux-service';

@Component({
  selector: 'app-book-list-item',
  imports: [NgOptimizedImage, RouterLink, CurrencyPipe, TranslocoDirective],
  templateUrl: './book-list-item.html',
  styleUrl: './book-list-item.css',
  providers: [UXService],
})
export class BookListItem implements OnInit {
  cartStore = inject(CartStore);
  ux = inject(UXService);
  @Input({ required: true }) product!: Product;

  ngOnInit() {
    this.ux.setProduct(this.product);
  }

  handleCartAction() {
    if (this.ux.isInCart()) {
      // If it's there, remove it
      this.cartStore.removeItem(this.product.id);
    } else if (this.product.availableCount > 0) {
      // If it's not, add it
      this.cartStore.addToCart(this.product);
    }
  }
}
