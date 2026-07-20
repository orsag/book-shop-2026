import { inject, Injectable } from '@angular/core';
import { DEFAULT_TYPE, Product, ProductType } from '@store/shared-models';
import { CartStore } from '../store/cart-store';
import { UserStore } from '../store/user-store';

const productGradients: Record<ProductType, string> = {
  BOOK: 'bg-gradient-to-br from-red-100 via-pink-100 to-purple-100 text-purple-900',
  GAME: 'bg-gradient-to-br from-violet-500 via-purple-600 to-fuchsia-600 text-white',
  GASTRO:
    'bg-gradient-to-br from-emerald-100 via-green-100 to-teal-100 text-emerald-900',
  GIFT_CARD:
    'bg-gradient-to-br from-gray-100 via-slate-200 to-zinc-200 text-zinc-900'
};

@Injectable({
  providedIn: 'root',
})
export class UXService {
  userStore = inject(UserStore);
  cart = inject(CartStore);

  isGradientClass(product: Product) {
    const productType = product.productType;
    if (productType) {
      return productGradients[productType];
    } else {
      return productGradients['GIFT_CARD'];
    }
  };

  isFavorite(product: Product) {
    const id = product.id;
    if (id) {
      return this.userStore.user()?.favorites?.includes(id);
    } else {
      return false;
    }
  };

  isInCart(product: Product) {
    const id = product.id;
    if (id) {
      return !!this.cart.itemsMap()[id];
    } else {
      return false;
    }
  }

  readingHours (product: Product) {
    if (product.productType === DEFAULT_TYPE) {
      const pages = product.bookDetails?.pageCount || 0;
      if (pages === 0) return 0;
      return Math.round((pages / 30) * 10) / 10;
    } else {
      return 0;
    }
  };

  category(product: Product) {
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
  };

  author(product: Product) {
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
  };
}
