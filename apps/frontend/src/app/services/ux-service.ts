import { computed, inject, Injectable, signal } from '@angular/core';
import { Product, ProductType } from '@store/shared-models';
import { AppStore } from '../store/app-store';
import { CartStore } from '../store/cart-store';

const productGradients: Record<ProductType, string> = {
  BOOK: 'bg-gradient-to-br from-red-100 via-pink-100 to-purple-100 text-purple-900',
  GAME: 'bg-gradient-to-br from-violet-500 via-purple-600 to-fuchsia-600 text-white',
  GASTRO:
    'bg-gradient-to-br from-emerald-100 via-green-100 to-teal-100 text-emerald-900',
  GIFT_CARD:
    'bg-gradient-to-br from-gray-100 via-slate-200 to-zinc-200 text-zinc-900',
  PUZZLE:
    'bg-gradient-to-br from-gray-100 via-slate-200 to-zinc-200 text-zinc-900',
  TOYS: 'bg-gradient-to-br from-gray-100 via-slate-200 to-zinc-200 text-zinc-900',
  CARDS:
    'bg-gradient-to-br from-gray-100 via-slate-200 to-zinc-200 text-zinc-900',
};

@Injectable()
export class UXService {
  store = inject(AppStore);
  cart = inject(CartStore);
  readonly product = signal<Product | null>(null);

  setProduct = (product: Product): void => {
    this.product.set(product);
  };

  isBook = computed(() => Boolean(this.product()?.bookDetails));
  isGame = computed(() => Boolean(this.product()?.gameDetails));
  isGastro = computed(() => Boolean(this.product()?.gastroDetails));
  isCard = computed(() => Boolean(this.product()?.cardDetails));

  isGradientClass = computed(() => {
    const productType = this.product()?.productType;
    if (productType) {
      return productGradients[productType];
    } else {
      return productGradients['GIFT_CARD'];
    }
  });

  isFavorite = computed(() => {
    const id = this.product()?.id;
    if (id) {
      return this.store.user()?.favorites?.includes(id);
    } else {
      return false;
    }
  });

  isInCart = computed(() => {
    const id = this.product()?.id;
    if (id) {
      return !!this.cart.itemsMap()[id];
    } else {
      return false;
    }
  });

  readingHours = computed(() => {
    if (this.product()?.productType === 'BOOK') {
      const pages = this.product()?.bookDetails?.pageCount || 0;
      if (pages === 0) return 0;
      return Math.round((pages / 30) * 10) / 10;
    } else {
      return 0;
    }
  });

  category = computed(() => {
    const product = this.product();
    if (product) {
      switch (product.productType) {
        case 'BOOK':
          return product.bookDetails?.category;
        case 'GAME':
          return product.gameDetails?.category;
        case 'GASTRO':
          return product.gastroDetails?.category;
        default:
          return '';
      }
    }
    return '';
  });

  author = computed(() => {
    const product = this.product();
    if (product) {
      switch (product.productType) {
        case 'BOOK':
          return product.bookDetails?.author;
        case 'GAME':
          return product.gameDetails?.producer;
        case 'GASTRO':
          return product.gastroDetails?.brand;
        default:
          return '';
      }
    }
    return '';
  });
}
