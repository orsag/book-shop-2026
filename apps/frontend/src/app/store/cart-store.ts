/* eslint-disable @typescript-eslint/no-unused-vars */
import { computed, effect, inject, PLATFORM_ID } from '@angular/core';
import { Product } from '@store/shared-models';
import {
  signalStore,
  withState,
  withMethods,
  withComputed,
  patchState,
  withHooks,
} from '@ngrx/signals';
import { BookService } from '../services/book-service';
import { isPlatformBrowser } from '@angular/common';

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CartState {
  itemsMap: Record<string, CartItem>;
  loading: boolean;
}

const initialState: CartState = {
  itemsMap: {},
  loading: false,
};

// Key for LocalStorage
const CART_STORAGE_KEY = 'app_cart_state';

export const CartStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),

  // 1. Computed Selectors (derived state)
  withComputed(({ itemsMap }) => ({
    items: computed(() => Object.values(itemsMap())),

    // Opravený subtotal, ktorý berie do úvahy zľavu
    subtotal: computed(() =>
      Object.values(itemsMap()).reduce((acc, item) => {
        const discountedPrice =
          item.product.price * (1 - item.product.discount);
        return acc + discountedPrice * item.quantity;
      }, 0),
    ),

    itemCount: computed(() =>
      Object.values(itemsMap()).reduce((acc, item) => acc + item.quantity, 0),
    ),

    totalSavings: computed(() =>
      Object.values(itemsMap()).reduce((acc, item) => {
        if (item.product.discount > 0) {
          const savingsPerItem = item.product.price * item.product.discount;
          return acc + savingsPerItem * item.quantity;
        }
        return acc;
      }, 0),
    ),
  })),

  withComputed(({ subtotal }) => ({
    tax: computed(() => subtotal() * 0.05),
    grandTotal: computed(() => subtotal() * 1.05), // total + 5% VAT
  })),

  // 2. Methods (actions)
  withMethods((store, bookService = inject(BookService)) => ({
    addToCart(product: Product) {
      const currentMap = store.itemsMap();
      const existing = currentMap[product.id];

      patchState(store, {
        itemsMap: {
          ...currentMap,
          [product.id]: {
            product,
            quantity: existing ? existing.quantity + 1 : 1,
          },
        },
      });
    },

    updateQuantity(productId: string, delta: number) {
      const currentMap = store.itemsMap();
      const item = currentMap[productId];
      if (!item) return;

      const newQuantity = item.quantity + delta;

      if (newQuantity <= 0) {
        const { [productId]: _, ...rest } = currentMap;
        patchState(store, { itemsMap: rest });
      } else {
        patchState(store, {
          itemsMap: {
            ...currentMap,
            [productId]: { ...item, quantity: newQuantity },
          },
        });
      }
    },

    removeItem(productId: string) {
      const { [productId]: _, ...rest } = store.itemsMap();
      patchState(store, { itemsMap: rest });
    },

    clearCart() {
      patchState(store, { itemsMap: {} });
    },

    // inside withMethods in cart-store.ts
    syncCartWithServer() {
      const ids = Object.keys(store.itemsMap());

      if (ids.length === 0) return;

      patchState(store, { loading: true });

      bookService.getFavorites(ids).subscribe({
        next: (freshBooks) => {
          const currentMap = { ...store.itemsMap() };
          const freshIds = new Set(freshBooks.map((b) => b.id));
          let hasChanges = false;

          freshBooks.forEach((freshBook) => {
            const item = currentMap[freshBook.id];
            if (item) {
              if (
                item.product.price !== freshBook.price ||
                item.product.discount !== freshBook.discount
              ) {
                currentMap[freshBook.id] = { ...item, product: freshBook };
                hasChanges = true;
              }
            }
          });

          // Optional: Remove items from cart that are no longer in the DB
          Object.keys(currentMap).forEach((id) => {
            if (!freshIds.has(id)) {
              delete currentMap[id];
              hasChanges = true;
            }
          });

          if (hasChanges) {
            patchState(store, { itemsMap: currentMap });
          }
          patchState(store, { loading: false });
        },
        error: () => patchState(store, { loading: false }),
      });
    },
  })),

  // 3. Storage Sync Logic
  withHooks({
    onInit(store) {
      const platformId = inject(PLATFORM_ID);
      const isBrowser = isPlatformBrowser(platformId);
      // Load from LocalStorage
      if (isBrowser) {
        const savedState = localStorage.getItem(CART_STORAGE_KEY);
        if (savedState) {
          try {
            patchState(store, JSON.parse(savedState));
          } catch (e) {
            console.error('Failed to parse cart storage state', e);
          }

          // Sync to LocalStorage on every change
          effect(() => {
            const state = { itemsMap: store.itemsMap() };
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state));
          });
        }
      }
    },
  }),
);
