import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { isPlatformBrowser } from '@angular/common';
import {
  catchError,
  distinctUntilChanged,
  EMPTY,
  filter,
  from,
  map,
  mergeMap,
  of,
  skip,
  switchMap,
  tap,
} from 'rxjs';
import { withLatestFrom } from 'rxjs';
import { BookService, OrderService } from '@service';
import { CreateProductDto as IProduct } from '@api';
import { CartItem } from '../types';
import {
  CART_STORAGE_KEY,
  CartActions,
  CartState,
  CartStateRoot,
  selectItemsMap,
} from './cart-store';

@Injectable()
export class CartEffects {
  private actions$ = inject(Actions);
  private store = inject(Store<CartStateRoot>);
  private bookService = inject(BookService);
  private orderService = inject(OrderService);
  private platformId = inject(PLATFORM_ID);

  /** Replaces the `syncCartWithServer` method. */
  syncCartWithServer$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CartActions.syncCartWithServer),
      withLatestFrom(this.store.select(selectItemsMap)),
      switchMap(([, itemsMap]) => {
        const ids = Object.keys(itemsMap);
        if (ids.length === 0) return EMPTY;

        return this.bookService.getFavorites(ids).pipe(
          map((freshBooks) => this.mergeFresh(freshBooks, itemsMap)),
          mergeMap((merged) =>
            merged ? of(CartActions.cartSynced({ itemsMap: merged })) : EMPTY,
          ),
          catchError(() => EMPTY), // swallow: cart keeps its local state
        );
      }),
    ),
  );

  /** Replaces the `reloadOrders` rxMethod. */
  reloadOrders$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CartActions.reloadOrders),
      switchMap(({ userId }) =>
        this.orderService.getUserOrders(userId).pipe(
          map((orders) => CartActions.ordersLoaded({ orders })),
          catchError(() => EMPTY), // swallow: orders stay as-is
        ),
      ),
    ),
  );

  /** Loads the persisted cart from LocalStorage on bootstrap (browser only). */
  hydrateCart$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CartActions.hydrate),
      filter(() => isPlatformBrowser(this.platformId)),
      mergeMap(() => {
        const savedState = localStorage.getItem(CART_STORAGE_KEY);
        if (!savedState) return EMPTY;

        try {
          const parsed = JSON.parse(savedState) as Partial<CartState>;
          const result = [];
          if (parsed.itemsMap) {
            result.push(CartActions.cartSynced({ itemsMap: parsed.itemsMap }));
          }
          return from(result);
        } catch (e) {
          console.error('Failed to parse cart storage state', e);
          return EMPTY;
        }
      }),
    ),
  );

  /** Persists the cart items to LocalStorage after hydration (browser only). */
  persistCart$ = createEffect(
    () =>
      this.store.select(selectItemsMap).pipe(
        filter(() => isPlatformBrowser(this.platformId)),
        skip(1), // don't wipe storage before hydration runs
        distinctUntilChanged(),
        tap((itemsMap) =>
          localStorage.setItem(
            CART_STORAGE_KEY,
            JSON.stringify({ itemsMap }),
          ),
        ),
      ),
    { dispatch: false },
  );

  private mergeFresh(
    freshBooks: IProduct[],
    currentMap: Record<string, CartItem>,
  ): Record<string, CartItem> | null {
    const merged = { ...currentMap };
    const freshIds = new Set(freshBooks.map((b) => b.id));
    let hasChanges = false;

    freshBooks.forEach((freshBook) => {
      const item = merged[freshBook.id];
      if (
        item &&
        (item.product.price !== freshBook.price ||
          item.product.discount !== freshBook.discount)
      ) {
        merged[freshBook.id] = { ...item, product: freshBook };
        hasChanges = true;
      }
    });

    // Remove items from cart that are no longer in the DB
    Object.keys(merged).forEach((id) => {
      if (!freshIds.has(id)) {
        delete merged[id];
        hasChanges = true;
      }
    });

    return hasChanges ? merged : null;
  }
}