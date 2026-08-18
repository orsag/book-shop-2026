import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Input,
} from '@angular/core';
import { CreateProductDto } from '@api';
import { RouterLink } from '@angular/router';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { CartStore, UserStore } from '@store';
import { TranslocoDirective } from '@jsverse/transloco';
import { LucideHeart } from '@lucide/angular';
import { CurrencyPipe } from '@angular/common';
import { UXService } from '@service';
import { RedFocusDirective, SinglePricePipe } from '@core';

@Component({
  selector: 'app-book-card',
  imports: [
    CommonModule,
    RouterLink,
    NgOptimizedImage,
    LucideHeart,
    TranslocoDirective,
    CurrencyPipe,
    RedFocusDirective,
    SinglePricePipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './book-card.html',
  styleUrl: './book-card.css',
})
export class BookCard {
  @Input({ required: true }) product!: CreateProductDto;
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
