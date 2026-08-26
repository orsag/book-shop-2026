import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  Input,
  signal,
} from '@angular/core';
import { CreateProductDto } from '@api';
import { RouterLink } from '@angular/router';
import { CommonModule, CurrencyPipe, NgOptimizedImage } from '@angular/common';
import { CartStore, UserStore } from '@store';
import { TranslocoDirective } from '@jsverse/transloco';
import { LucideHeart } from '@lucide/angular';
import { UXService } from '@service';
import { RedFocusDirective, SinglePricePipe } from '@core';
import { OverlayComponent } from '../common';
import { AppStore } from '@store';

@Component({
  selector: 'app-product-item',
  imports: [
    CommonModule,
    RouterLink,
    NgOptimizedImage,
    LucideHeart,
    TranslocoDirective,
    CurrencyPipe,
    RedFocusDirective,
    SinglePricePipe,
    OverlayComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-item.html',
  styleUrl: './product-item.css',
})
export class ProductItem {
  @Input({ required: true }) product!: CreateProductDto;

  private readonly cartStore = inject(CartStore);
  private readonly appStore = inject(AppStore);
  readonly userStore = inject(UserStore);
  readonly ux = inject(UXService);
  readonly isHovered = signal(false);

  readonly isGrid = computed(() => this.appStore.viewLayout() === 'grid');

  toggleFavorite(productId: string) {
    if (!this.userStore.isLoggedIn()) {
      return;
    }
    this.userStore.toggleFavorite(productId);
  }

  handleCartAction() {
    if (this.ux.isInCart(this.product)) {
      this.cartStore.removeItem(this.product.id);
    } else if (this.product.availableCount > 0) {
      this.cartStore.addToCart(this.product);
    }
  }
}
