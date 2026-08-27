/**
 * ============================================================================
 * CLASSIC (OLD-FASHIONED) NgRx STORE - Cart
 * ============================================================================
 *
 * This file is a re-implementation of `cart-store.ts` using the traditional
 * NgRx pattern instead of the modern SignalStore (@ngrx/signals).
 *
 * How the classic approach works:
 *
 *   1. ACTIONS      - Plain objects describing "what happened".
 *                     They are the ONLY way to change state.
 *   2. REDUCER      - A pure function (oldState, action) => newState.
 *                     It never mutates state and never has side effects.
 *   3. SELECTORS    - Pure functions that derive/extract slices of state
 *                     for the UI (the classic counterpart of `withComputed`).
 *   4. META-REDUCER - A higher-order reducer used here for localStorage
 *                     persistence (the classic counterpart of `withHooks`).
 *
 * This store is NOT registered in any AppModule and NOT injected anywhere -
 * it is a standalone reference implementation.
 * To activate it you would normally do:
 *
 *   StoreModule.forRoot({})                    // in AppModule
 *   StoreModule.forFeature(CART_FEATURE_KEY, reducer, { metaReducers })  // lazy feature
 *   provideStore() / provideState()            // standalone APIs equivalent
 *
 * NOTE: Side-effects (HTTP calls) do NOT belong in reducers. They live in
 * @ngrx/effects classes - see `cart-classic.effects.ts` which listens for
 * `loadOrders` / `syncCartStart` and dispatches the Success/Fail actions
 * consumed by this reducer.
 */

import { Action, createAction, createReducer, on, props } from '@ngrx/store';
import { createSelector, createFeatureSelector } from '@ngrx/store';
import { OrderStatus } from '@store/shared-models';
import { CreateProductDto } from '@api';
import { CreatedOrder } from '@service';

// ----------------------------------------------------------------------------
// STATE SHAPE (equivalent of CartState + initialState in the SignalStore)
// ----------------------------------------------------------------------------

/** One line item of the cart: the product plus how many times it was added. */
export interface ClassicCartItem {
  product: CreateProductDto;
  quantity: number;
}

export interface ClassicCartState {
  readonly itemsMap: Record<string, ClassicCartItem>; // productId -> item
  readonly isLoading: boolean;
  readonly orders: CreatedOrder[];
}

export const initialState: ClassicCartState = {
  itemsMap: {},
  isLoading: false,
  orders: [],
};

/** Key under which this feature is registered AND persisted to LocalStorage. */
export const CART_CLASSIC_FEATURE_KEY = 'classic_cart';

/** Key for LocalStorage persistence (same trick as in cart-store.ts). */
const CLASSIC_CART_STORAGE_KEY = 'app_classic_cart_state';

// ----------------------------------------------------------------------------
// ACTIONS
// ----------------------------------------------------------------------------
// Every possible state transition is described as an action with its payload.
// Components/effects dispatch them; they never touch the state directly.

/** Add one unit of a product to the cart (or bump quantity if already there). */
export const addToCart = createAction(
  '[Cart] Add To Cart',
  props<{ product: CreateProductDto }>(),
);

/** Change quantity of a product by +/- delta. Reducer removes item at <= 0. */
export const updateQuantity = createAction(
  '[Cart] Update Quantity',
  props<{ productId: string; delta: number }>(),
);

/** Remove a single product from the cart completely. */
export const removeItem = createAction(
  '[Cart] Remove Item',
  props<{ productId: string }>(),
);

/** Empty the whole cart. */
export const clearCart = createAction('[Cart] Clear Cart');

/**
 * Server sync lifecycle (in the SignalStore this was `syncCartWithServer()`).
 * A component/effect would dispatch syncStart, then map the HTTP response to
 * syncSuccess / syncFail.
 */
export const syncCartStart = createAction('[Cart] Sync With Server Start');
export const syncCartSuccess = createAction(
  '[Cart] Sync With Server Success',
  props<{ freshBooks: CreateProductDto[] }>(), // fresh prices/discounts from DB
);
export const syncCartFail = createAction('[Cart] Sync With Server Fail');

/** Locally update the status of one order (e.g. after payment). */
export const updateOrderLocal = createAction(
  '[Cart] Update Order Status Locally',
  props<{ id: string; status: OrderStatus }>(),
);

/** Locally remove one order from the list. */
export const removeOrderLocal = createAction(
  '[Cart] Remove Order Locally',
  props<{ id: string }>(),
);

/** Trigger dispatched by a component; handled by ClassicCartEffects. */
export const loadOrders = createAction(
  '[Cart] Load Orders',
  props<{ userId: string }>(),
);

/** Orders were fetched from the API (SignalStore: `reloadOrders`). */
export const loadOrdersSuccess = createAction(
  '[Cart] Load Orders Success',
  props<{ orders: CreatedOrder[] }>(),
);

export const loadOrdersFail = createAction('[Cart] Load Orders Fail');

// Union of all cart actions - handy typing for the reducer & effects.
export type ClassicCartActions =
  | ReturnType<typeof addToCart>
  | ReturnType<typeof updateQuantity>
  | ReturnType<typeof removeItem>
  | ReturnType<typeof clearCart>
  | typeof syncCartStart
  | ReturnType<typeof syncCartSuccess>
  | typeof syncCartFail
  | ReturnType<typeof updateOrderLocal>
  | ReturnType<typeof removeOrderLocal>
  | typeof loadOrders
  | ReturnType<typeof loadOrdersSuccess>
  | typeof loadOrdersFail;

// ----------------------------------------------------------------------------
// REDUCER
// ----------------------------------------------------------------------------
// Pure function: takes current state + action, returns a NEW state object.
// All immutability is done manually (spread operators) - no patchState magic.

export const classicCartReducer = createReducer(
  initialState,

  // Add product: if it exists bump quantity by 1, otherwise insert with qty 1.
  on(addToCart, (state, { product }) => {
    const existing = state.itemsMap[product.id];
    return {
      ...state,
      itemsMap: {
        ...state.itemsMap,
        [product.id]: {
          product,
          quantity: existing ? existing.quantity + 1 : 1,
        },
      },
    };
  }),

  // Change quantity by delta; drop the product entirely when it reaches <= 0.
  on(updateQuantity, (state, { productId, delta }) => {
    const item = state.itemsMap[productId];
    if (!item) return state;

    const newQuantity = item.quantity + delta;
    if (newQuantity <= 0) {
      const { [productId]: _, ...rest } = state.itemsMap;
      return { ...state, itemsMap: rest };
    }
    return {
      ...state,
      itemsMap: {
        ...state.itemsMap,
        [productId]: { ...item, quantity: newQuantity },
      },
    };
  }),

  // Remove exactly one product from the map.
  on(removeItem, (state, { productId }) => {
    const { [productId]: _, ...rest } = state.itemsMap;
    return { ...state, itemsMap: rest };
  }),

  // Reset items back to an empty map.
  on(clearCart, (state) => ({ ...state, itemsMap: {} })),

  // Sync started -> turn the loading flag on.
  on(syncCartStart, (state) => ({ ...state, isLoading: true })),

  /**
   * Fresh data came from the server:
   *  - replace products whose price/discount changed,
   *  - drop cart items that no longer exist in the DB,
   *  - turn the loading flag off.
   */
  on(syncCartSuccess, (state, { freshBooks }) => {
    const freshIds = new Set(freshBooks.map((b) => b.id));
    const currentMap: Record<string, ClassicCartItem> = {};

    Object.values(state.itemsMap).forEach((item) => {
      const fresh = freshBooks.find((b) => b.id === item.product.id);
      if (fresh) {
        // keep item, refresh price/discount if they changed
        currentMap[fresh.id] = {
          ...item,
          product:
            fresh.price !== item.product.price ||
            fresh.discount !== item.product.discount
              ? fresh
              : item.product,
        };
      }
      // items not present in freshIds are silently removed
    });

    void freshIds; // kept for parity with the original Set-based check
    return { ...state, itemsMap: currentMap, isLoading: false };
  }),

  // Sync failed -> only reset loading flag, keep local data untouched.
  on(syncCartFail, (state) => ({ ...state, isLoading: false })),

  // Update status of a single order by id.
  on(updateOrderLocal, (state, { id, status }) => ({
    ...state,
    orders: state.orders.map((order) =>
      order.id === id ? { ...order, status } : order,
    ),
  })),

  // Filter out one order by id.
  on(removeOrderLocal, (state, { id }) => ({
    ...state,
    orders: state.orders.filter((order) => order.id !== id),
  })),

  // Replace the whole orders list with freshly fetched ones.
  on(loadOrdersSuccess, (state, { orders }) => ({
    ...state,
    orders,
    isLoading: false,
  })),

  // Trigger action itself: reducers may react to it to flip the loading flag
  // while the HTTP call is in flight inside ClassicCartEffects.
  on(loadOrders, (state) => ({ ...state, isLoading: true })),

  on(loadOrdersFail, (state) => ({ ...state, isLoading: false })),
);

// ----------------------------------------------------------------------------
// SELECTORS
// ----------------------------------------------------------------------------
// Selectors are pure functions over the state tree, memoized by @ngrx/store.
// Components subscribe via store.select(selector) - the classic alternative
// to reading signals. Same derived values as `withComputed` in cart-store.ts.

/** Feature selector: grabs the whole cart slice from the root AppStore. */
export const selectClassicCartState =
  createFeatureSelector<ClassicCartState>(CART_CLASSIC_FEATURE_KEY);

/** All cart items as a plain array (map values). */
export const selectItems = createSelector(
  selectClassicCartState,
  (state) => Object.values(state.itemsMap),
);

/**
 * Subtotal respecting per-product discount:
 * sum( price * (1 - discount) * quantity )
 */
export const selectSubtotal = createSelector(selectItems, (items) =>
  items.reduce((acc, item) => {
    const discountedPrice = item.product.price * (1 - item.product.discount);
    return acc + discountedPrice * item.quantity;
  }, 0),
);

/** Total number of units in the cart (not unique products). */
export const selectItemCount = createSelector(selectItems, (items) =>
  items.reduce((acc, item) => acc + item.quantity, 0),
);

/** Money saved thanks to discounts across all items. */
export const selectTotalSavings = createSelector(selectItems, (items) =>
  items.reduce((acc, item) => {
    if (item.product.discount > 0) {
      const savingsPerItem = item.product.price * item.product.discount;
      return acc + savingsPerItem * item.quantity;
    }
    return acc;
  }, 0),
);

/** 5% VAT computed FROM the subtotal selector (selectors compose!). */
export const selectTax = createSelector(
  selectSubtotal,
  (subtotal) => subtotal * 0.05,
);

/** Subtotal + VAT. */
export const selectGrandTotal = createSelector(
  selectSubtotal,
  (subtotal) => subtotal * 1.05,
);

/** Loading flag (used to show spinners while syncing/loading orders). */
export const selectIsLoading = createSelector(
  selectClassicCartState,
  (state) => state.isLoading,
);

/** All locally cached orders. */
export const selectOrders = createSelector(
  selectClassicCartState,
  (state) => state.orders,
);

// ----------------------------------------------------------------------------
// META-REDUCER: LocalStorage persistence (classic replacement for withHooks)
// ----------------------------------------------------------------------------
// A meta-reducer wraps the actual reducer. Here it:
//   1. HYDRATES  - before first dispatch, merges saved JSON into initialState.
//   2. PERSISTS  - after every action writes the itemsMap back to storage.
//
// In a real app you'd also guard with isPlatformBrowser(platformId) so SSR
// does not crash on `localStorage`; omitted here since nothing consumes it.

export function localStorageMetaReducer(
  reducer: (state: ClassicCartState | undefined, action: Action) => ClassicCartState,
): (state: ClassicCartState | undefined, action: Action) => ClassicCartState {
  return (state, action) => {
    if (action.type === '@@ngrx/init' && state === undefined) {
      // Hydration: try to read previously saved cart from LocalStorage.
      const saved = localStorage.getItem(CLASSIC_CART_STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as Pick<
            ClassicCartState,
            'itemsMap'
          >;
          state = { ...initialState, itemsMap: parsed.itemsMap ?? {} };
        } catch (e) {
          console.error('Failed to parse cart storage state', e);
        }
      }
    }

    // Run the real reducer first...
    const nextState = reducer(state, action);

    // ...then persist only what matters (items), like the SignalStore effect.
    try {
      localStorage.setItem(
        CLASSIC_CART_STORAGE_KEY,
        JSON.stringify({ itemsMap: nextState.itemsMap }),
      );
    } catch {
      // storage might be unavailable (private mode/quota) - ignore
    }

    return nextState;
  };
}

/**
 * Everything needed to plug this into the app later, e.g.:
 *
 *   StoreModule.forFeature(CART_CLASSIC_FEATURE_KEY, classicCartReducer, {
 *     metaReducers: [localStorageMetaReducer],
 *   })
 *
 * or with standalone providers:
 *
 *   provideState(CART_CLASSIC_FEATURE_KEY, classicCartReducer)
 */
