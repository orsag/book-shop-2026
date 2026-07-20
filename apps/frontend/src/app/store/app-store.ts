import {
  signalStore,
  withState,
  withMethods,
  withComputed,
  patchState,
  withHooks,
  withProps,
} from '@ngrx/signals';
import {
  computed,
  inject,
  linkedSignal,
  PLATFORM_ID,
  Resource,
  resourceFromSnapshots,
  ResourceSnapshot,
} from '@angular/core';
import { ActionResponse, ProductType } from '@store/shared-models';
import { Product as IProduct } from '@store/shared-models';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tap, delay } from 'rxjs';
import { pipe, switchMap } from 'rxjs';
import { BookService } from '../services/book-service';
import { ErrorCodes, ErrorService, SuccessCodes } from '../core/error.handler';
import { isPlatformBrowser } from '@angular/common';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  ViewLayout,
  VIEW_LAYOUTS,
  DEFAULT_TYPE,
  DEFAULT_PAGE,
  DEFAULT_MAX_LIMIT,
  DEFAULT_SEARCH,
} from '@store/libs';

// Key for LocalStorage
const SEARCH_HISTORY_KEY = 'searchHistory';

export interface AppState {
  token: string | null;
  _isMobile: boolean;
  _isTablet: boolean;
  // --- 📚 Book State ---
  favoriteProducts: IProduct[];
  totalProducts: number;
  isLoading: boolean;
  viewLayout: ViewLayout;
  searchHistory: string[];
  appendMode: boolean;
  booksVersion: number;
  // --- 🔍 Filter State ---
  filters: {
    type: ProductType;
    page: number;
    limit: number;
    search: string;
    category: string | null;
    sortBy: string | null;
    isDiscounted: boolean;
  };
}

const initialState: AppState = {
  _isMobile: false,
  _isTablet: false,
  token: null,
  favoriteProducts: [],
  totalProducts: 0,
  isLoading: false,
  viewLayout: VIEW_LAYOUTS[1],
  searchHistory: [],
  appendMode: false,
  booksVersion: 0,
  filters: {
    type: DEFAULT_TYPE,
    page: DEFAULT_PAGE,
    limit: DEFAULT_MAX_LIMIT,
    search: DEFAULT_SEARCH,
    category: null,
    sortBy: null,
    isDiscounted: false,
  },
};

// RESOURCE FIX
export function withPreviousValue<T>(resource: Resource<T>): Resource<T> {
  const derivedResource = linkedSignal({
    source: resource.snapshot,
    computation: (snap, prev): ResourceSnapshot<T> => {
      if (snap.status == 'loading' && prev && prev.value.status !== 'error') {
        return { ...snap, value: prev.value.value };
      }
      return snap;
    },
  });
  return resourceFromSnapshots(derivedResource);
}

export const AppStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),

  // 1. Instantiate the Resource using withProps
  withProps((store, bookService = inject(BookService)) => ({
    productsResource: rxResource<
      { data: IProduct[]; meta: { total: number } }, // 1. Output Data Type
      { filters: AppState['filters']; append: boolean } // 2. Request Object Type
    >({
      params: () => ({
        filters: store.filters(),
        append: store.appendMode(),
      }),
      stream: ({ params }) => {
        return bookService.fetchProducts(params.filters).pipe(delay(1000));
      },
    }),
  })),

  // 1. Computed Values (Like Selectors)
  withComputed(({ productsResource, filters, _isMobile, _isTablet }) => {
    return {
      isMobile: computed(() => _isMobile()),
      isTablet: computed(() => _isTablet()),
      isDesktop: computed(() => !_isMobile() && !_isTablet()),
      isBook: computed(() => filters().type === 'BOOK'),
      isGame: computed(() => filters().type === 'GAME'),
      isGastro: computed(() => filters().type === 'GASTRO'),
      isEmpty: computed(() => (productsResource.value()?.meta.total ?? 0) == 0),
      currentType: computed(() => filters().type as ProductType),
      // MOVE calculations inside the responsive signal body here:
      totalPages: computed(() =>
        Math.ceil(
          (productsResource.value()?.meta.total ?? 0) / filters().limit,
        ),
      ),
      totalProducts: computed(() => productsResource.value()?.meta.total ?? 0),
      products: computed(() => productsResource.value()?.data ?? []),
      hasError: computed(() => !!productsResource.error()),
      isLoading: computed(() => productsResource.isLoading()),
      hasMorePage: computed(
        () =>
          filters.page() <
          Math.ceil(
            (productsResource.value()?.meta.total ?? 0) / filters().limit,
          ),
      ),
    };
  }),

  // 2. Methods (Like Actions/Reducers)
  withMethods(
    (
      store,
      bookService = inject(BookService),
      errorService = inject(ErrorService),
    ) => ({
      // Update filters without triggering a fetch automatically
      updateFilters(newFilters: Partial<AppState['filters']>) {
        patchState(store, (state) => ({
          appendMode: false,
          filters: { ...state.filters, ...newFilters, page: 1 },
        }));
      },

      deleteBook: rxMethod<string>(
        pipe(
          switchMap((bookId) =>
            bookService.delete(bookId).pipe(
              tap({
                next: (res: ActionResponse) => {
                  if (res.warning) {
                    errorService.handleError(ErrorCodes.PRODUCT_DELETE);
                  } else {
                    errorService.handleSuccess(SuccessCodes.PRODUCT_DELETE);
                    // 🚀 Increment version to auto-trigger rxResource reload
                    patchState(store, (state) => ({
                      booksVersion: state.booksVersion + 1,
                    }));
                  }
                },
                error: () => {
                  errorService.handleError(ErrorCodes.PRODUCT_DELETE);
                },
              }),
            ),
          ),
        ),
      ),

      saveBook: rxMethod<{ id?: string | null; data: Partial<IProduct> }>(
        pipe(
          switchMap(({ id, data }) => {
            // 1. Conditionally choose the service call
            const request$ = id
              ? bookService.update(id, data)
              : bookService.create(data);

            return request$.pipe(
              tap({
                next: () => {
                  // Success handler based on operation type
                  const code = id
                    ? SuccessCodes.PRODUCT_UPDATE
                    : SuccessCodes.PRODUCT_CREATE;
                  errorService.handleSuccess(code);

                  // Trigger resource refetch
                  patchState(store, (state) => ({
                    booksVersion: state.booksVersion + 1,
                  }));
                },
                error: (err) => {
                  const code = id
                    ? ErrorCodes.PRODUCT_UPDATE
                    : ErrorCodes.PRODUCT_CREATE;
                  errorService.handleError(code);
                  console.error(err);
                },
              }),
            );
          }),
        ),
      ),

      loadMore() {
        patchState(store, (state) => ({
          appendMode: true,
          filters: { ...state.filters, page: state.filters.page + 1 },
        }));
      },

      setPage(page: number) {
        patchState(store, (state) => ({
          appendMode: false,
          filters: {
            ...state.filters,
            page: page,
          },
        }));
      },

      setToken(token: string | null) {
        patchState(store, { token });
      },

      setViewLayout(layout: 'grid' | 'list') {
        patchState(store, { viewLayout: layout });
      },

      // In app-store.ts
      toggleSort(type: 'price' | null) {
        const current = store.filters().sortBy;
        let next: string | null = null;

        if (type === 'price') {
          if (current === 'price_desc') {
            next = null;
          } else {
            next = current === 'price_asc' ? 'price_desc' : 'price_asc';
          }
        } else {
          next = null;
        }

        this.updateFilters({ sortBy: next });
      },

      addToHistory(searchTerm: string) {
        if (!searchTerm.trim()) return;

        patchState(store, (state) => {
          // Remove duplicate if exists, then put new search on top
          const newHistory = [
            searchTerm,
            ...state.searchHistory.filter((h) => h !== searchTerm),
          ].slice(0, 10); // Limit to 10 items

          localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
          return { searchHistory: newHistory };
        });
      },
    }),
  ),

  // 3. Automated Lifecycle & Persistence
  withHooks({
    onInit(store, platformId = inject(PLATFORM_ID)) {
      const isBrowser = isPlatformBrowser(platformId);

      if (isBrowser) {
        const savedHistory = localStorage.getItem(SEARCH_HISTORY_KEY);

        // history
        if (savedHistory) {
          patchState(store, { searchHistory: JSON.parse(savedHistory) });
        }

        const breakpointObserver = inject(BreakpointObserver);

        breakpointObserver
          .observe([Breakpoints.XSmall, Breakpoints.Small, Breakpoints.Medium])
          .pipe(takeUntilDestroyed())
          .subscribe((result) => {
            // XSmall is standard mobile viewports (max-width: 599.98px)
            const isMobileView = result.breakpoints[Breakpoints.XSmall];

            // Small & Medium capture typical vertical/horizontal tablet boundaries (600px - 1279.98px)
            const isTabletView =
              result.breakpoints[Breakpoints.Small] ||
              result.breakpoints[Breakpoints.Medium];

            patchState(store, {
              _isMobile: !!isMobileView,
              _isTablet: !!isTabletView,
            });
          });
      }
    },
  }),
);
