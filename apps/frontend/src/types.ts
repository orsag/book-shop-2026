import { CreateProductDto as IProduct } from '@api';
import { CreateProductDtoProductType as ProductType } from '@api';
import { Signal } from '@angular/core';
import { CartItem } from '@store';

export type AppComputedSignals = {
  readonly isMobile: Signal<boolean>;
  readonly isTablet: Signal<boolean>;
  readonly isDesktop: Signal<boolean>;
  readonly isBook: Signal<boolean>;
  readonly isGame: Signal<boolean>;
  readonly isGastro: Signal<boolean>;
  readonly isEmpty: Signal<boolean>;
  readonly currentType: Signal<ProductType>;
  readonly totalPages: Signal<number>;
  readonly totalProducts: Signal<number>;
  readonly products: Signal<IProduct[]>;
  readonly hasError: Signal<boolean>;
  readonly hasMorePage: Signal<boolean>;
};

export type CartComputedSignals = {
  readonly items: Signal<CartItem[]>;
  readonly subtotal: Signal<number>;
  readonly itemCount: Signal<number>;
  readonly totalSavings: Signal<number>;
};

export type UserComputedSignals = {
  readonly isLoggedIn: Signal<boolean>;
  readonly isAdmin: Signal<boolean>;
  readonly isPremium: Signal<boolean>;
  readonly favoriteCount: Signal<number>;
  readonly cartCount: Signal<number>;
};

export interface BookFilters {
  type: ProductType;
  search: string;
  // isAvailable: boolean;
  // isBestSeller: boolean;
  // isNewRelease: boolean;
  isDiscounted: boolean;
  category: string | null;
}

export interface PaginatedProducts {
  data: IProduct[];
  meta: {
    total: number;
    page: number;
    lastPage: number;
    count: number;
  };
}
