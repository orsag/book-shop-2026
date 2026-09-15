import { ChangeDetectionStrategy, Component, computed, inject, Input, signal } from '@angular/core';
import { CreateProductDto } from '@api';
import { RouterLink } from '@angular/router';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { UserStore } from '@store';
import { TranslocoDirective } from '@jsverse/transloco';
import { UXService } from '../../services/ux-service';
import { ConfigurationService } from '@service';
import { SinglePricePipe } from '@core';
import { MatButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { Store } from '@ngrx/store';
import { CartActions, CartStateRoot } from '@ngrx';

@Component({
  selector: 'app-product-item',
  imports: [
    CommonModule,
    RouterLink,
    TranslocoDirective,
    CurrencyPipe,
    MatButton,
    MatTooltip,
    SinglePricePipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-item.html',
  styleUrl: './product-item.css',
})
export class ProductItem {
  @Input({ required: true }) product!: CreateProductDto;

  private readonly cartStore = inject(Store<CartStateRoot>);
  readonly userStore = inject(UserStore);
  readonly ux = inject(UXService);
  readonly config = inject(ConfigurationService);
  readonly isHovered = signal(false);

  readonly gradientClass = computed(() => {
    const gradients: Record<CreateProductDto['productType'], string> = {
      BOOK: 'product-gradient-book',
      GAME: 'product-gradient-game',
      GASTRO: 'product-gradient-gastro',
      GIFT_CARD: 'product-gradient-gift-card',
    };
    return gradients[this.product.productType] ?? 'product-gradient-gift-card';
  });

  toggleFavorite(productId: string) {
    if (!this.userStore.isLoggedIn()) {
      return;
    }
    this.userStore.toggleFavorite(productId);
  }

  handleCartAction() {
    if (this.ux.isInCart(this.product)) {
      this.cartStore.dispatch(
        CartActions.removeItem({ productId: this.product.id }),
      );
    } else if (this.product.availableCount > 0) {
      this.cartStore.dispatch(CartActions.addToCart({ product: this.product }));
    }
  }
}