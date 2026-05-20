import {
  signalStore,
  withState,
  withMethods,
  withComputed,
  patchState,
  withHooks,
} from '@ngrx/signals';
import { computed, effect, inject, PLATFORM_ID } from '@angular/core';
import {
  OrderStatus,
  PremiumStatus,
  ProductType,
  User,
  UserDetail,
  UserDetailSmall,
} from '@store/shared-models';
import { tapResponse } from '@ngrx/operators';
import { Product as IProduct } from '@store/shared-models';
import { AuthService } from '../services/auth-service';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tap, map, filter, of, distinctUntilChanged } from 'rxjs';
import { pipe, switchMap, catchError, finalize, EMPTY } from 'rxjs';
import { BookService } from '../services/book-service';
import { DetailService } from '../services/detail-service';
import {
  ErrorCodes,
  ErrorHandlerService,
  SuccessCodes,
} from '../core/error.handler';
import { isPlatformBrowser, registerLocaleData } from '@angular/common';
import localeSk from '@angular/common/locales/sk';
import { CreatedOrder, OrderService } from '../services/order-service';

registerLocaleData(localeSk);

// Key for LocalStorage
const USER_STORAGE_KEY = 'currentUser';
const TOKEN_STORAGE_KEY = 'accessToken';
const DETAIL_STORAGE_KEY = 'currentStatus';
const SEARCH_HISTORY_KEY = 'searchHistory';

export interface AppState {
  user: User | null;
  userDetail: UserDetail | null;
  token: string | null;
  premiumStatus: PremiumStatus | null;
  width: number;
  // --- 📚 Book State ---
  products: IProduct[];
  orders: CreatedOrder[];
  favoriteProducts: IProduct[];
  totalProducts: number;
  isLoading: boolean;
  viewLayout: 'grid' | 'list';
  searchHistory: string[];
  // --- 🔍 Filter State ---
  filters: {
    type: ProductType;
    page: number;
    limit: number;
    search: string;
    category: string | null;
    sortBy: string | null;
    // isAvailable: boolean;
    // isBestSeller: boolean;
    // isNewRelease: boolean;
    isDiscounted: boolean;
  };
}

const initialState: AppState = {
  user: null,
  userDetail: null,
  token: null,
  premiumStatus: null,
  width: 1200,
  products: [],
  orders: [],
  favoriteProducts: [],
  totalProducts: 0,
  isLoading: false,
  viewLayout: 'list' as 'grid' | 'list',
  searchHistory: [],
  filters: {
    type: 'BOOK' as ProductType,
    page: 1,
    limit: 18,
    search: '',
    category: null,
    sortBy: null,
    // isAvailable: false,
    // isBestSeller: false,
    // isNewRelease: false,
    isDiscounted: false,
  },
};

export const AppStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),

  // 1. Computed Values (Like Selectors)
  withComputed(({ user, totalProducts, products, filters, width }) => ({
    isMobile: computed(() => width() < 768),
    isTablet: computed(() => width() >= 768 && width() < 1024),
    isBook: computed(() => filters().type === 'BOOK'),
    isGame: computed(() => filters().type === 'GAME'),
    isGastro: computed(() => filters().type === 'GASTRO'),
    isLoggedIn: computed(() => !!user()),
    isAdmin: computed(() => user()?.isAdmin ?? false),
    isEmpty: computed(() => products().length == 0),
    currentType: computed(() => filters().type.toString()),
    favoriteCount: computed(() => user()?.favorites?.length ?? 0),
    cartCount: computed(() => user()?.cartItems?.length ?? 0),
    totalPages: computed(() => Math.ceil(totalProducts() / filters().limit)),
    hasMorePage: computed(
      () => filters.page() < Math.ceil(totalProducts() / filters().limit),
    ),
  })),

  // 2. Methods (Like Actions/Reducers)
  withMethods(
    (
      store,
      orderService = inject(OrderService),
      bookService = inject(BookService),
      authService = inject(AuthService),
      detailService = inject(DetailService),
      errorService = inject(ErrorHandlerService),
    ) => ({
      // Update filters without triggering a fetch automatically
      updateFilters(newFilters: Partial<AppState['filters']>) {
        patchState(store, (state) => ({
          filters: { ...state.filters, ...newFilters, page: 1 },
        }));
        this.loadBooks();
      },

      // Explicitly call this ONLY when needed
      loadBooks: rxMethod<{ append?: boolean } | void>(
        pipe(
          // Map the input argument (or default to empty object if called without arguments)
          map((args) => args || { append: false }),
          tap(() => patchState(store, { isLoading: true })),
          switchMap(({ append }) => {
            const params: Partial<AppState['filters']> = store.filters();

            return bookService.fetchProducts(params).pipe(
              tap({
                next: (res) => {
                  patchState(store, {
                    products: append
                      ? [...store.products(), ...res.data]
                      : res.data,
                    totalProducts: res.meta.total,
                    isLoading: false,
                  });
                },
                error: () => {
                  patchState(store, { isLoading: false });
                  errorService.handleError(ErrorCodes.FETCH_BOOKS);
                },
              }),
              // Catch the error internally so the main rxMethod stream doesn't die permanently
              catchError(() => EMPTY),
            );
          }),
        ),
      ),

      loadMore() {
        patchState(store, (state) => ({
          filters: { ...state.filters, page: state.filters.page + 1 },
        }));
        this.loadBooks({ append: true });
      },

      setPage(page: number) {
        patchState(store, (state) => ({
          filters: {
            ...state.filters,
            page: page,
          },
        }));
        this.loadBooks();
      },

      _syncFavorites: rxMethod<string[]>(
        pipe(
          distinctUntilChanged(
            (prev, curr) =>
              prev.length === curr.length &&
              prev.every((id, i) => id === curr[i]),
          ),
          switchMap((ids) => {
            if (ids.length === 0) {
              patchState(store, { favoriteProducts: [], isLoading: false });
              return of([]);
            }

            patchState(store, { isLoading: true });
            return bookService.getFavorites(ids).pipe(
              tap((books) => {
                patchState(store, {
                  favoriteProducts: books,
                  isLoading: false,
                });
              }),
              catchError(() => {
                patchState(store, { isLoading: false });
                return of([]);
              }),
            );
          }),
        ),
      ),

      login: rxMethod<{ username: string; onSuccess?: () => void }>(
        pipe(
          tap(() => patchState(store, { isLoading: true })),
          switchMap(({ username, onSuccess }) =>
            authService.login(username).pipe(
              // Chain the premium status call
              switchMap(({ user, access_token }) =>
                detailService.findPremiumStatus(user.id).pipe(
                  tap((premiumStatus) => {
                    errorService.handleSuccess(SuccessCodes.LOGIN);
                    if (onSuccess) onSuccess();
                    // Update state with everything at once
                    patchState(store, {
                      user,
                      token: access_token,
                      premiumStatus: premiumStatus, // Make sure this exists in your state
                      isLoading: false,
                    });
                  }),
                  // Catch error for premium status specifically if you want
                  // the user to still be logged in even if premium check fails
                  catchError(() => {
                    errorService.handleError(ErrorCodes.PREMIUM);
                    // Still log the user in, just without premium status
                    patchState(store, {
                      user,
                      token: access_token,
                      isLoading: false,
                    });
                    return of(null);
                  }),
                ),
              ),
              catchError(() => {
                errorService.handleError(ErrorCodes.LOGIN);
                patchState(store, { isLoading: false });
                return EMPTY;
              }),
            ),
          ),
        ),
      ),

      logout: rxMethod<void>(
        pipe(
          map(() => store.token()),
          filter((token): token is string => !!token),

          switchMap(() =>
            authService.logout().pipe(
              tap(() => {
                errorService.handleSuccess(SuccessCodes.LOGOUT);
              }),
              catchError(() => {
                errorService.handleError(ErrorCodes.LOGOUT);
                // Even if backend fails, we proceed with local cleanup
                return of(null); // Use 'of' instead of EMPTY to ensure finalize runs
              }),
              finalize(() => {
                // 2. ALWAYS wipe the local state and storage
                patchState(store, {
                  user: null,
                  premiumStatus: null,
                  token: null,
                });
                localStorage.removeItem(DETAIL_STORAGE_KEY);
                localStorage.removeItem(USER_STORAGE_KEY);
                localStorage.removeItem(TOKEN_STORAGE_KEY);
              }),
            ),
          ),
        ),
      ),

      refreshUser: rxMethod<void>(
        pipe(
          // Map to the current username from the store
          map(() => store.user()?.username),
          // Only proceed if we actually have a logged-in user
          filter((username): username is string => !!username),
          switchMap((username) =>
            authService.getUser(username).pipe(
              tap((updatedUser) => {
                patchState(store, { user: updatedUser });
                // Persistence sync
                localStorage.setItem('user', JSON.stringify(updatedUser));
              }),
              catchError((err) => {
                errorService.handleError(ErrorCodes.REFRESH);
                console.error(err);
                return EMPTY;
              }),
            ),
          ),
        ),
      ),

      setUser(user: User) {
        patchState(store, { user });
      },

      clearUser() {
        patchState(store, { user: null });
      },

      toggleFavorite: rxMethod<string>(
        pipe(
          switchMap((productId) => {
            const currentUser = store.user();
            const token = store.token(); //

            // If user is not logged in or token is missing, we can't sync
            if (!currentUser || !token) return EMPTY; //

            // 1. Calculate new favorites array locally
            const isFavorite = currentUser.favorites.includes(productId);
            const updatedFavorites = isFavorite
              ? currentUser.favorites.filter((id) => id !== productId)
              : [...currentUser.favorites, productId];

            // 2. Optimistic Update: Update UI immediately
            const updatedUser = { ...currentUser, favorites: updatedFavorites };
            patchState(store, { user: updatedUser }); //

            // 3. Sync with Backend using the token
            return authService
              .updateUserFavorites(updatedFavorites) // Pass the token here
              .pipe(
                catchError(() => {
                  errorService.handleError(ErrorCodes.TOGGLE_FAVORITE); //
                  // Rollback: If backend fails, revert the state to the original user object
                  patchState(store, { user: currentUser }); //
                  return EMPTY;
                }),
              );
          }),
        ),
      ),

      // Inside AppStore withMethods
      updateUserProfile: rxMethod<{ updates: Partial<User> }>(
        pipe(
          tap(() => patchState(store, { isLoading: true })),
          switchMap(({ updates }) => {
            const currentUser = store.user();
            const token = store.token();

            // Guard: Ensure we have a user and a token before proceeding
            if (!currentUser || !token) {
              patchState(store, { isLoading: false });
              return EMPTY;
            }

            // Whitelist only the safe fields to be sent to the backend
            const safeUpdates = {
              email: updates.email,
              phoneNumber: updates.phoneNumber,
              theme: updates.theme,
            };

            // Pass the token to the authService instead of (or in addition to) the username
            return authService.updateProfile(safeUpdates).pipe(
              tap((updatedUser) => {
                errorService.handleSuccess(SuccessCodes.UPDATE_PROFILE);
                patchState(store, { user: updatedUser, isLoading: false });
              }),
              catchError(() => {
                errorService.handleError(ErrorCodes.UPDATE_PROFILE);
                patchState(store, { isLoading: false });
                return EMPTY;
              }),
            );
          }),
        ),
      ),

      updateUserDetail: rxMethod<{
        userId: string;
        updates: Partial<UserDetailSmall>;
      }>(
        pipe(
          tap(() => patchState(store, { isLoading: true })),
          switchMap(({ userId, updates }) => {
            return detailService.updateUserDetail(userId, updates).pipe(
              tap((updatedDetail: UserDetail) => {
                errorService.handleSuccess(SuccessCodes.UPDATE_PROFILE);
                patchState(store, {
                  userDetail: updatedDetail,
                  isLoading: false,
                });
              }),
              catchError(() => {
                errorService.handleError(ErrorCodes.UPDATE_PROFILE);
                patchState(store, { isLoading: false });
                return EMPTY;
              }),
            );
          }),
        ),
      ),

      loadUserDetail: rxMethod<{ userId: string }>(
        pipe(
          tap(() => patchState(store, { isLoading: true })),
          switchMap(({ userId }) =>
            detailService.getUserDetailById(userId).pipe(
              tap((userDetail: UserDetail) => {
                patchState(store, {
                  userDetail: userDetail,
                  isLoading: false,
                });
              }),
              catchError(() => {
                errorService.handleError(ErrorCodes.LOAD_PROFILE);
                patchState(store, { isLoading: false });
                return EMPTY;
              }),
            ),
          ),
        ),
      ),

      setViewLayout(layout: 'grid' | 'list') {
        patchState(store, { viewLayout: layout });
      },

      // In app-store.ts
      toggleSort(type: 'price' | null) {
        const current = store.filters().sortBy;
        let next: string | null = null;

        if (type === 'price') {
          next = current === 'price_asc' ? 'price_desc' : 'price_asc';
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

      updateOrderLocal(id: string, status: OrderStatus) {
        patchState(store, {
          orders: store
            .orders()
            .map((order) => (order.id === id ? { ...order, status } : order)),
        });
      },

      removeOrderLocal(id: string) {
        patchState(store, {
          orders: store.orders().filter((order) => order.id !== id),
        });
      },

      reloadOrders: rxMethod<{ userId: string }>(
        pipe(
          tap(() => patchState(store, { isLoading: true })),
          switchMap(({ userId }) =>
            orderService.getUserOrders(userId).pipe(
              tapResponse({
                next: (orders) => {
                  patchState(store, {
                    orders: orders,
                    isLoading: false,
                  });
                },
                error: () => {
                  patchState(store, { isLoading: false });
                },
              }),
            ),
          ),
        ),
      ),
    }),
  ),

  // 3. Automated Lifecycle & Persistence
  withHooks({
    onInit(store, platformId = inject(PLATFORM_ID)) {
      const isBrowser = isPlatformBrowser(platformId);

      if (isBrowser) {
        const savedUser = localStorage.getItem(USER_STORAGE_KEY);
        const savedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
        const savedDetail = localStorage.getItem(DETAIL_STORAGE_KEY);
        const savedHistory = localStorage.getItem(SEARCH_HISTORY_KEY);

        // Automatically react to user favorite ID changes
        const favoriteIds = computed(() => store.user()?.favorites || []);
        store._syncFavorites(favoriteIds);

        if (savedUser && savedToken) {
          patchState(store, {
            user: JSON.parse(savedUser),
            token: savedToken,
          });
        }

        if (savedDetail) {
          patchState(store, {
            premiumStatus: JSON.parse(savedDetail),
          });
        }

        // history
        if (savedHistory) {
          patchState(store, { searchHistory: JSON.parse(savedHistory) });
        }

        // Only run in the browser to avoid SSR errors
        window.addEventListener('resize', () => {
          // Update the state
          patchState(store, { width: window.innerWidth });
        });

        effect(() => {
          const { user, token, userDetail } = store;
          if (userDetail()) {
            localStorage.setItem(
              DETAIL_STORAGE_KEY,
              JSON.stringify(userDetail()),
            );
          } else {
            localStorage.removeItem(DETAIL_STORAGE_KEY);
          }
          const _token = token();
          if (user() && _token) {
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user()));
            localStorage.setItem(TOKEN_STORAGE_KEY, _token);
          } else {
            localStorage.removeItem(USER_STORAGE_KEY);
            localStorage.removeItem(TOKEN_STORAGE_KEY);
          }
        });
      }
    },
  }),
);
