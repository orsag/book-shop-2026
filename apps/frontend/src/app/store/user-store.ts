import { PLATFORM_ID, inject, computed, effect } from '@angular/core';
import { UserComputedSignals } from '../../types';
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

export type UserState = {
  readonly user: User | null;
  readonly userDetail: CreateUserDetailDto | null;
  readonly premiumStatus: PremiumStatus | null;
  readonly isDirtyForm: boolean;
};

const initialState: UserState = {
  user: null,
  userDetail: null,
  premiumStatus: null,
  isDirtyForm: false,
};

export const UserStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ user, premiumStatus }): UserComputedSignals => ({
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
          switchMap((credentials) =>
            authService.register(credentials).pipe(
              tapResponse({
                next: ({ user }) => {
                  if (user) {
                    errorService.handleSuccess(SuccessCodes.REGISTER);
                    patchState(store, { user });
                  } else {
                    errorService.handleError(ErrorCodes.REGISTER);
                  }
                },
                error: () => {
                  errorService.handleError(ErrorCodes.REGISTER);
                  return EMPTY;
                },
              }),
            ),
          ),
        ),
      ),

      login(credentials: { username: string; password: string }) {
        return authService
          .login(credentials.username, credentials.password)
          .pipe(
            switchMap(({ user, access_token }) => {
              patchState(store, { user });
              appStore.setToken(access_token);
              localStorage.setItem(TOKEN_STORAGE_KEY, access_token);

              return detailService.findPremiumStatus(user.id).pipe(
                map((premiumStatus) => {
                  errorService.handleSuccess(SuccessCodes.LOGIN);
                  patchState(store, { premiumStatus });
                  return { success: true, user, premiumStatus };
                }),
                catchError(() => {
                  errorService.handleError(ErrorCodes.PREMIUM);
                  return of({ success: true, user, premiumStatus: null });
                }),
              );
            }),
            catchError(() => {
              errorService.handleError(ErrorCodes.LOGIN);
              return of({ success: false, user: null, premiumStatus: null });
            }),
          );
      },

      logout: rxMethod<void>(
        pipe(
          map(() => appStore.token()),
          filter((token): token is string => !!token),
          exhaustMap(() => {
            return authService.logout().pipe(
              tap(() => {
                errorService.handleSuccess(SuccessCodes.LOGOUT);
              }),
              catchError(() => {
                errorService.handleError(ErrorCodes.LOGOUT);
                return of(null);
              }),
              finalize(() => {
                // ALWAYS clean local disk footprint
                patchState(store, {
                  user: null,
                  premiumStatus: null,
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
          switchMap(({ updates }) => {
            const currentUser = store.user();
            const token = appStore.token();

            // Guard: Ensure we have a user and a token before proceeding
            if (!currentUser || !token) {
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
                patchState(store, { user: updatedUser });
              }),
              catchError(() => {
                errorService.handleError(ErrorCodes.UPDATE_PROFILE);
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
          switchMap(({ userId, updates }) => {
            return detailService.updateUserDetail(userId, updates).pipe(
              tap((updatedDetail: CreateUserDetailDto) => {
                errorService.handleSuccess(SuccessCodes.UPDATE_PROFILE);
                patchState(store, { userDetail: updatedDetail });
              }),
              catchError(() => {
                errorService.handleError(ErrorCodes.UPDATE_PROFILE);
                return EMPTY;
              }),
            );
          }),
        ),
      ),

      loadUserDetail: rxMethod<{ userId: string }>(
        pipe(
          switchMap(({ userId }) =>
            detailService.getUserDetailById(userId).pipe(
              tap((userDetail: CreateUserDetailDto) => {
                patchState(store, { userDetail });
              }),
              catchError(() => {
                errorService.handleError(ErrorCodes.LOAD_PROFILE);
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
                localStorage.setItem(
                  USER_STORAGE_KEY,
                  JSON.stringify(updatedUser),
                );
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

      updateStore<K extends keyof UserState>(key: K, value: UserState[K]) {
        patchState(store, {
          [key]: value,
        });
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
