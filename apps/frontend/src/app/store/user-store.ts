import { PLATFORM_ID, inject, computed, effect } from '@angular/core';
import {
  signalStore,
  withState,
  withComputed,
  withMethods,
  withHooks,
  patchState,
} from '@ngrx/signals';
import { PremiumStatus, User, UserDetailSmall } from '@store/libs';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, exhaustMap, filter, finalize } from 'rxjs/operators';
import { EMPTY, map, of, pipe, switchMap, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { ErrorCodes, ErrorService, SuccessCodes } from '@core';
import { AuthService, DetailService } from '@service';
import { AppStore } from './app-store';
import { isPlatformBrowser } from '@angular/common';
import { CreateUserDetailDto } from '@api';

const USER_STORAGE_KEY = 'currentUser';
const TOKEN_STORAGE_KEY = 'accessToken';
const DETAIL_STORAGE_KEY = 'currentStatus';

export interface UserState {
  user: User | null;
  userDetail: CreateUserDetailDto | null;
  premiumStatus: PremiumStatus | null;
  isLoading: boolean;
}

const initialState: UserState = {
  user: null,
  userDetail: null,
  premiumStatus: null,
  isLoading: false,
};

export const UserStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ user, premiumStatus }) => ({
    isLoggedIn: computed(() => !!user()),
    isAdmin: computed(() => user()?.isAdmin ?? false),
    isPremium: computed(() => premiumStatus()?.isPremium ?? false),
    favoriteCount: computed(() => user()?.favorites?.length ?? 0),
    cartCount: computed(() => user()?.cartItems?.length ?? 0),
  })),
  withMethods(
    (
      store,
      appStore = inject(AppStore),
      authService = inject(AuthService),
      detailService = inject(DetailService),
      errorService = inject(ErrorService),
    ) => ({
      register: rxMethod<{
        username: string;
        password: string;
        email: string;
      }>(
        pipe(
          // 1. Set the loading state when the action is triggered
          tap(() => patchState(store, { isLoading: true })),

          // 2. Cancel previous requests if a user spams clicks
          switchMap((credentials) =>
            authService.register(credentials).pipe(
              tapResponse({
                next: ({ user }) => {
                  if (user) {
                    errorService.handleSuccess(SuccessCodes.REGISTER);
                    patchState(store, {
                      user,
                      isLoading: false,
                    });
                  } else {
                    errorService.handleError(ErrorCodes.REGISTER);
                    patchState(store, { isLoading: false });
                  }
                },
                error: () => {
                  errorService.handleError(ErrorCodes.REGISTER);
                  patchState(store, { isLoading: false });
                  return EMPTY;
                },
              }),
            ),
          ),
        ),
      ),

      login(credentials: { username: string; password: string }) {
        patchState(store, { isLoading: true });

        return authService.login(credentials.username, credentials.password).pipe(
          switchMap(({ user, access_token }) => {
            patchState(store, { user });
            appStore.setToken(access_token);
            localStorage.setItem(TOKEN_STORAGE_KEY, access_token);

            return detailService.findPremiumStatus(user.id).pipe(
              map((premiumStatus) => {
                errorService.handleSuccess(SuccessCodes.LOGIN);
                patchState(store, {
                  premiumStatus: premiumStatus,
                  isLoading: false,
                });
                return { success: true, user, premiumStatus };
              }),
              catchError(() => {
                errorService.handleError(ErrorCodes.PREMIUM);
                patchState(store, { isLoading: false });
                return of({ success: true, user, premiumStatus: null });
              }),
            );
          }),
          catchError(() => {
            errorService.handleError(ErrorCodes.LOGIN);
            patchState(store, { isLoading: false });
            return of({ success: false, user: null, premiumStatus: null });
          }),
        );
      },

      logout: rxMethod<void>(
        pipe(
          // 1. Immediately drop the request if another logout execution is already active
          filter(() => !store.isLoading()),
          map(() => appStore.token()),
          filter((token): token is string => !!token),

          // 2. exhaustMap blocks any subsequent clicks until the inner stream completes
          exhaustMap(() => {
            // Set a local loading guard state flag (Optional, but excellent UX)
            patchState(store, { isLoading: true });

            return authService.logout().pipe(
              tap(() => {
                errorService.handleSuccess(SuccessCodes.LOGOUT);
              }),
              catchError(() => {
                errorService.handleError(ErrorCodes.LOGOUT);
                return of(null);
              }),
              finalize(() => {
                // 3. ALWAYS clean local disk footprint and turn off execution guard
                patchState(store, {
                  user: null,
                  premiumStatus: null,
                  isLoading: false, // Reset your guard block
                });
                appStore.setToken(null);
                localStorage.removeItem(DETAIL_STORAGE_KEY);
                localStorage.removeItem(USER_STORAGE_KEY);
                localStorage.removeItem(TOKEN_STORAGE_KEY);
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
            const token = appStore.token();

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
        user: Partial<User>;
      }>(
        pipe(
          tap(() => patchState(store, { isLoading: true })),
          switchMap(({ userId, updates }) => {
            return detailService.updateUserDetail(userId, updates).pipe(
              tap((updatedDetail: CreateUserDetailDto) => {
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
              tap((userDetail: CreateUserDetailDto) => {
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
                localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
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

      toggleFavorite: rxMethod<string>(
        pipe(
          switchMap((productId) => {
            const currentUser = store.user();
            const token = appStore.token();
            if (!currentUser || !token) return EMPTY;

            // 1. Calculate new favorites array locally
            const isFavorite = currentUser.favorites?.includes(productId);
            const oldArray = currentUser.favorites
              ? [...currentUser.favorites]
              : [];
            const updatedFavorites = isFavorite
              ? currentUser.favorites?.filter((id) => id !== productId)
              : [...oldArray, productId];

            // 2. Optimistic Update: Update UI immediately
            const updatedUser = { ...currentUser, favorites: updatedFavorites };
            patchState(store, { user: updatedUser }); //

            // 3. Sync with Backend using the token
            if (updatedFavorites) {
              return authService.updateUserFavorites(updatedFavorites);
            } else {
              return EMPTY;
            }
          }),
        ),
      ),

      invalidateUser() {
        patchState(store, {
          user: null,
          userDetail: null,
          premiumStatus: null,
        });
      },

      updateStore(
        user?: User | null,
        userDetail?: CreateUserDetailDto | null,
        premiumStatus?: PremiumStatus | null,
      ) {
        const partialState: Partial<UserState> = {};

        if (user !== undefined) partialState.user = user;
        if (userDetail !== undefined) partialState.userDetail = userDetail;
        if (premiumStatus !== undefined)
          partialState.premiumStatus = premiumStatus;

        patchState(store, partialState);
      },
    }),
  ),
  withHooks({
    onInit(
      store,
      appStore = inject(AppStore),
      platformId = inject(PLATFORM_ID),
    ) {
      const isBrowser = isPlatformBrowser(platformId);

      if (isBrowser) {
        effect(() => {
          const { user, userDetail } = store;
          if (userDetail()) {
            localStorage.setItem(
              DETAIL_STORAGE_KEY,
              JSON.stringify(userDetail()),
            );
          }
          const _token = appStore.token();
          if (user() && _token) {
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user()));
            localStorage.setItem(TOKEN_STORAGE_KEY, _token);
          }
        });
      }
    },
  }),
);
