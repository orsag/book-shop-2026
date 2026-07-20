import { Component, inject, Input } from '@angular/core';
import { Product } from '@store/shared-models';
import { RouterLink } from '@angular/router';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { CartStore } from '../../store/cart-store';
import { TranslocoDirective } from '@jsverse/transloco';
import { LucideHeart } from '@lucide/angular';
import { UXService } from '../../services/ux-service';
import { UserStore } from '../../store/user-store';

@Component({
  selector: 'app-card-small',
  imports: [
    CommonModule,
    RouterLink,
    LucideHeart,
    NgOptimizedImage,
    TranslocoDirective,
  ],
  templateUrl: './card-small.html',
  styleUrl: './card-small.css',
})
export class CardSmall {
  @Input({ required: true }) product!: Product;
  private readonly cartStore = inject(CartStore);
  readonly userStore = inject(UserStore);
  ux = inject(UXService);

  toggleFavorite(productId: string) {
    if (!this.userStore.isLoggedIn()) {
      // Show a common or redirect to login
      return;
    }
    // We will build this method in the Store next!
    this.userStore.toggleFavorite(productId);
  }

  handleCartAction() {
    if (this.ux.isInCart(this.product)) {
      // If it's there, remove it
      this.cartStore.removeItem(this.product.id);
    } else {
      // If it's not, add it
      this.cartStore.addToCart(this.product);
    }
  }
}
