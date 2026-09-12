import { createActionGroup, createReducer, createSelector, emptyProps, on, props } from '@ngrx/store';
import { OrderStatus } from '@store/shared-models';
import { CartItem } from '../types';
import { CreateProductDto as IProduct } from '@api';
import { CreatedOrder } from '@service';

// Key for LocalStorage
export const CART_STORAGE_KEY = 'app_cart_state';

export const cartFeatureKey = 'cart';

export interface CartState {
  readonly itemsMap: Record<string, CartItem>;
  readonly orders: CreatedOrder[];
}

export interface CartStateRoot {
  [cartFeatureKey]: CartState;
}

export const initialState: CartState = {
  itemsMap: {},
  orders: [],
};

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------
export const CartActions = createActionGroup({
  source: 'Cart',
  events: {
    // --- 🛒 UI Actions (Dispatched by Components) ---
    'Add To Cart': props<{ product: IProduct }>(),
    'Update Quantity': props<{ productId: string; delta: number }>(),
    'Remove Item': props<{ productId: string }>(),
    'Clear Cart': emptyProps(),
    'Sync Cart With Server': emptyProps(),
    'Update Order Local': props<{ id: string; status: OrderStatus }>(),
    'Remove Order Local': props<{ id: string }>(),
    'Reload Orders': props<{ userId: string }>(),
    'Hydrate': emptyProps(),
    // --- ✅ Result Actions (Dispatched by Effects) ---
    'Cart Synced': props<{ itemsMap: Record<string, CartItem> }>(),
    'Orders Loaded': props<{ orders: CreatedOrder[] }>(),
  },
});

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------
export const cartReducer = createReducer(
  initialState,

  on(CartActions.addToCart, (state, { product }) => {
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

  on(CartActions.updateQuantity, (state, { productId, delta }) => {
    const item = state.itemsMap[productId];
    if (!item) return state;

    const newQuantity = item.quantity + delta;

    if (newQuantity <= 0) {
      return {
        ...state,
        itemsMap: Object.fromEntries(
          Object.entries(state.itemsMap).filter(([id]) => id !== productId),
        ),
      };
    }

    return {
      ...state,
      itemsMap: {
        ...state.itemsMap,
        [productId]: { ...item, quantity: newQuantity },
      },
    };
  }),

  on(CartActions.removeItem, (state, { productId }) => ({
    ...state,
    itemsMap: Object.fromEntries(
      Object.entries(state.itemsMap).filter(([id]) => id !== productId),
    ),
  })),

  on(CartActions.clearCart, (state) => ({
    ...state,
    itemsMap: {},
  })),

  on(CartActions.cartSynced, (state, { itemsMap }) => ({
    ...state,
    itemsMap,
  })),

  on(CartActions.updateOrderLocal, (state, { id, status }) => ({
    ...state,
    orders: state.orders.map((order) =>
      order.id === id ? { ...order, status } : order,
    ),
  })),

  on(CartActions.removeOrderLocal, (state, { id }) => ({
    ...state,
    orders: state.orders.filter((order) => order.id !== id),
  })),

  on(CartActions.ordersLoaded, (state, { orders }) => ({
    ...state,
    orders,
  })),
);

// ---------------------------------------------------------------------------
// Selectors
// ---------------------------------------------------------------------------
export const selectCartState = (state: CartStateRoot): CartState =>
  state[cartFeatureKey];

export const selectItemsMap = createSelector(
  selectCartState,
  (state) => state.itemsMap,
);

export const selectItems = createSelector(selectItemsMap, (itemsMap) =>
  Object.values(itemsMap),
);

// Subtotal that takes the discount into account
export const selectSubtotal = createSelector(selectItems, (items) =>
  items.reduce((acc, item) => {
    const discountedPrice = item.product.price * (1 - item.product.discount);
    return acc + discountedPrice * item.quantity;
  }, 0),
);

export const selectItemCount = createSelector(selectItems, (items) =>
  items.reduce((acc, item) => acc + item.quantity, 0),
);

export const selectTotalSavings = createSelector(selectItems, (items) =>
  items.reduce((acc, item) => {
    if (item.product.discount > 0) {
      const savingsPerItem = item.product.price * item.product.discount;
      return acc + savingsPerItem * item.quantity;
    }
    return acc;
  }, 0),
);

export const selectTax = createSelector(
  selectSubtotal,
  (subtotal) => subtotal * 0.05,
);

export const selectGrandTotal = createSelector(
  selectSubtotal,
  (subtotal) => subtotal * 1.05, // subtotal + 5% VAT
);

export const selectOrders = createSelector(
  selectCartState,
  (state) => state.orders,
);