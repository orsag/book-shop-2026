import { createActionGroup, createReducer, createSelector, emptyProps, on, props } from '@ngrx/store';
import { CreateProductDto as IProduct } from '@api';
import { CreateProductDtoProductType as ProductType } from '@api';
import { PaginatedProducts } from '../types';
import {
  ViewLayout,
  DEFAULT_TYPE,
  DEFAULT_PAGE,
  DEFAULT_MAX_LIMIT,
  DEFAULT_SEARCH,
} from '@store/libs';

// Key for LocalStorage
export const SEARCH_HISTORY_KEY = 'searchHistory';

export const appFeatureKey = 'app';

export interface Filters {
  type: ProductType;
  page: number;
  limit: number;
  search: string;
  category: string | null;
  sortBy: string | null;
  isDiscounted: boolean;
}

export interface AppState {
  readonly _isMobile: boolean;
  readonly _isTablet: boolean;
  readonly favoriteProducts: IProduct[];
  readonly viewLayout: ViewLayout;
  readonly searchHistory: string[];
  readonly appendMode: boolean;
  readonly booksVersion: number;
  readonly customProducts: PaginatedProducts | null;
  readonly filters: Filters;
  readonly productsResponse: PaginatedProducts | null;
  readonly productsLoading: boolean;
  readonly productsError: unknown;
}

export interface AppStateRoot {
  [appFeatureKey]: AppState;
}

export const initialState: AppState = {
  _isMobile: false,
  _isTablet: false,
  favoriteProducts: [],
  viewLayout: 'list', // VIEW_LAYOUTS[1]
  searchHistory: [],
  appendMode: false,
  booksVersion: 0,
  customProducts: null,
  filters: {
    type: DEFAULT_TYPE,
    page: DEFAULT_PAGE,
    limit: DEFAULT_MAX_LIMIT,
    search: DEFAULT_SEARCH,
    category: null,
    sortBy: null,
    isDiscounted: false,
  },
  productsResponse: null,
  productsLoading: false,
  productsError: null,
};

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------
export const AppActions = createActionGroup({
  source: 'App',
  events: {
    // --- 🎛️ UI Actions (Dispatched by Components) ---
    'Update Filters': props<{ partial: Partial<Filters> }>(),
    'Load More': emptyProps(),
    'Set Page': props<{ page: number }>(),
    'Set History': props<{ searchHistory: string[] }>(),
    'Set View Layout': props<{ layout: ViewLayout }>(),
    'Toggle Sort': props<{ sortType: 'price' | null }>(),
    'Add To History': props<{ searchTerm: string }>(),
    'Delete Product': props<{ bookId: string }>(),
    'Save Product': props<{ id?: string | null; data: Partial<IProduct> }>(),
    'Load Custom Products': props<{ filters?: Partial<Filters> }>(),
    // --- 📚 Products Resource ---
    'Load Products': emptyProps(),
    'Set Device Info': props<{ isMobile: boolean; isTablet: boolean }>(),
    // --- ✅ Result Actions (Dispatched by Effects) ---
    'Products Loaded': props<{ response: PaginatedProducts }>(),
    'Products Load Error': props<{ error: unknown }>(),
    'Custom Products Loaded': props<{ response: PaginatedProducts }>(),
    'Custom Products Load Error': props<{ error: unknown }>(),
    'Product Deleted': props<{ bookId: string }>(),
    'Product Saved': props<{ id?: string | null; data: Partial<IProduct> }>(),
  },
});

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------
export const appReducer = createReducer(
  initialState,

  on(AppActions.updateFilters, (state, { partial }) => ({
    ...state,
    appendMode: false,
    productsLoading: true,
    productsError: null,
    filters: { ...state.filters, ...partial, page: 1 },
  })),

  on(AppActions.loadMore, (state) => ({
    ...state,
    appendMode: true,
    productsLoading: true,
    productsError: null,
    filters: { ...state.filters, page: state.filters.page + 1 },
  })),

  on(AppActions.setPage, (state, { page }) => ({
    ...state,
    appendMode: false,
    productsLoading: true,
    productsError: null,
    filters: { ...state.filters, page },
  })),

  on(AppActions.setHistory, (state, { searchHistory }) => ({
    ...state,
    searchHistory,
  })),

  on(AppActions.setViewLayout, (state, { layout }) => ({
    ...state,
    viewLayout: layout,
  })),

  on(AppActions.toggleSort, (state, { sortType }) => {
    const current = state.filters.sortBy;
    let next: string | null = null;

    if (sortType === 'price') {
      if (current === 'price_desc') {
        next = null;
      } else {
        next = current === 'price_asc' ? 'price_desc' : 'price_asc';
      }
    }

    return {
      ...state,
      appendMode: false,
      productsLoading: true,
      productsError: null,
      filters: { ...state.filters, sortBy: next, page: 1 },
    };
  }),

  on(AppActions.addToHistory, (state, { searchTerm }) => {
    if (!searchTerm.trim()) return state;

    // Remove duplicates, then put the searched term on top, limit to 10 items
    const searchHistory = [
      searchTerm,
      ...state.searchHistory.filter((h) => h !== searchTerm),
    ].slice(0, 10);

    return { ...state, searchHistory };
  }),

  on(AppActions.setDeviceInfo, (state, { isMobile, isTablet }) => ({
    ...state,
    _isMobile: isMobile,
    _isTablet: isTablet,
  })),

  on(AppActions.loadProducts, (state) => ({
    ...state,
    productsLoading: true,
    productsError: null,
  })),

  on(AppActions.productsLoaded, (state, { response }) => ({
    ...state,
    productsResponse: response,
    productsLoading: false,
    productsError: null,
  })),

  on(AppActions.productsLoadError, (state, { error }) => ({
    ...state,
    productsResponse: null,
    productsLoading: false,
    productsError: error,
  })),

  on(AppActions.customProductsLoaded, (state, { response }) => ({
    ...state,
    customProducts: response,
  })),

  on(AppActions.productDeleted, (state) => ({
    ...state,
    booksVersion: state.booksVersion + 1,
  })),

  on(AppActions.productSaved, (state) => ({
    ...state,
    booksVersion: state.booksVersion + 1,
  })),
);

// ---------------------------------------------------------------------------
// Selectors
// ---------------------------------------------------------------------------
export const selectAppState = (state: AppStateRoot): AppState =>
  state[appFeatureKey];

export const selectAppFilters = createSelector(
  selectAppState,
  (state) => state.filters,
);

export const selectAppendMode = createSelector(
  selectAppState,
  (state) => state.appendMode,
);

export const selectIsMobile = createSelector(
  selectAppState,
  (state) => state._isMobile,
);

export const selectIsTablet = createSelector(
  selectAppState,
  (state) => state._isTablet,
);

export const selectIsDesktop = createSelector(
  selectIsMobile,
  selectIsTablet,
  (isMobile, isTablet) => !isMobile && !isTablet,
);

export const selectProductType = createSelector(
  selectAppFilters,
  (filters) => filters.type,
);

export const selectIsBook = createSelector(
  selectProductType,
  (type) => type === 'BOOK',
);

export const selectIsGame = createSelector(
  selectProductType,
  (type) => type === 'GAME',
);

export const selectIsGastro = createSelector(
  selectProductType,
  (type) => type === 'GASTRO',
);

export const selectProductsResponse = createSelector(
  selectAppState,
  (state) => state.productsResponse,
);

export const selectProducts = createSelector(
  selectProductsResponse,
  (response) => response?.data ?? [],
);

export const selectTotalProducts = createSelector(
  selectProductsResponse,
  (response) => response?.meta.total ?? 0,
);

export const selectTotalPages = createSelector(
  selectProductsResponse,
  selectAppFilters,
  (response, filters) =>
    Math.ceil((response?.meta.total ?? 0) / filters.limit),
);

export const selectHasMorePage = createSelector(
  selectAppFilters,
  selectTotalPages,
  (filters, totalPages) => filters.page < totalPages,
);

export const selectIsEmpty = createSelector(
  selectTotalProducts,
  (total) => total === 0,
);

export const selectProductsLoading = createSelector(
  selectAppState,
  (state) => state.productsLoading,
);

export const selectProductsError = createSelector(
  selectAppState,
  (state) => state.productsError,
);

export const selectHasError = createSelector(
  selectProductsError,
  (error) => !!error,
);

export const selectSearchHistory = createSelector(
  selectAppState,
  (state) => state.searchHistory,
);

export const selectCustomProducts = createSelector(
  selectAppState,
  (state) => state.customProducts,
);

export const selectBooksVersion = createSelector(
  selectAppState,
  (state) => state.booksVersion,
);

export const selectViewLayout = createSelector(
  selectAppState,
  (state) => state.viewLayout,
);

export const selectFavoriteProducts = createSelector(
  selectAppState,
  (state) => state.favoriteProducts,
);