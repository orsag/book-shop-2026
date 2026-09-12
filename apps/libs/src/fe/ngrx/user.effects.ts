import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import {
  catchError,
  EMPTY,
  exhaustMap,
  finalize,
  map,
  mergeMap,
  of,
  switchMap,
  tap,
} from 'rxjs';
import { withLatestFrom } from 'rxjs';
import { AuthService, DetailService } from '@service';
import { ErrorCodes, ErrorService, SuccessCodes } from '@core';
import { CreateUserDetailDto } from '@api';
import {
  DETAIL_STORAGE_KEY,
  USER_STORAGE_KEY,
  UserActions,
  UserStateRoot,
  selectUser,
} from './user-store';

@Injectable()
export class UserEffects {
  private actions$ = inject(Actions);
  private store = inject(Store<UserStateRoot>);
  private authService = inject(AuthService);
  private detailService = inject(DetailService);
  private errorService = inject(ErrorService);

  /** Replaces the `register` rxMethod. */
  register$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.register),
      switchMap(({ credentials }) =>
        this.authService.register(credentials).pipe(
          mergeMap(({ user }) => {
            if (user) {
              this.errorService.handleSuccess(SuccessCodes.REGISTER);
              return of(UserActions.registerSuccess({ user }));
            }
            this.errorService.handleError(ErrorCodes.REGISTER);
            return EMPTY;
          }),
          catchError(() => {
            this.errorService.handleError(ErrorCodes.REGISTER);
            return EMPTY;
          }),
        ),
      ),
    ),
  );

  /** Replaces the `login` method. */
  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.login),
      switchMap(({ credentials }) =>
        this.authService.login(credentials.username, credentials.password).pipe(
          switchMap(({ user }) => {
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));

            return this.detailService.findPremiumStatus(user.id).pipe(
              map((premiumStatus) => {
                this.errorService.handleSuccess(SuccessCodes.LOGIN);
                return UserActions.loginSuccess({ user, premiumStatus });
              }),
              catchError(() => {
                this.errorService.handleError(ErrorCodes.PREMIUM);
                return of(UserActions.loginSuccess({ user, premiumStatus: null }));
              }),
            );
          }),
          catchError(() => {
            this.errorService.handleError(ErrorCodes.LOGIN);
            return EMPTY;
          }),
        ),
      ),
    ),
  );

  /** Replaces the `logout` rxMethod (always clears local state + storage). */
  logout$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(UserActions.logout),
        exhaustMap(() =>
          this.authService.logout().pipe(
            tap(() => this.errorService.handleSuccess(SuccessCodes.LOGOUT)),
            catchError(() => {
              this.errorService.handleError(ErrorCodes.LOGOUT);
              return of(null);
            }),
            finalize(() => {
              localStorage.removeItem(DETAIL_STORAGE_KEY);
              localStorage.removeItem(USER_STORAGE_KEY);
            }),
          ),
        ),
      ),
    { dispatch: false },
  );

  /** Replaces the `updateUserProfile` rxMethod. */
  updateUserProfile$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.updateUserProfile),
      withLatestFrom(this.store.select(selectUser)),
      switchMap(([{ updates }, currentUser]) => {
        if (!currentUser) return EMPTY;

        // Whitelist only the safe fields to be sent to the backend
        const safeUpdates = {
          email: updates.email,
          phoneNumber: updates.phoneNumber,
          theme: updates.theme,
        };

        return this.authService.updateProfile(safeUpdates).pipe(
          tap(() => this.errorService.handleSuccess(SuccessCodes.UPDATE_PROFILE)),
          map((updatedUser) =>
            UserActions.userProfileUpdated({ user: updatedUser }),
          ),
          catchError(() => {
            this.errorService.handleError(ErrorCodes.UPDATE_PROFILE);
            return EMPTY;
          }),
        );
      }),
    ),
  );

  /** Replaces the `updateUserDetail` rxMethod. */
  updateUserDetail$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.updateUserDetail),
      switchMap(({ userId, updates }) =>
        this.detailService.updateUserDetail(userId, updates).pipe(
          tap(() => this.errorService.handleSuccess(SuccessCodes.UPDATE_PROFILE)),
          map((updatedDetail: CreateUserDetailDto) =>
            UserActions.userDetailUpdated({ userDetail: updatedDetail }),
          ),
          catchError(() => {
            this.errorService.handleError(ErrorCodes.UPDATE_PROFILE);
            return EMPTY;
          }),
        ),
      ),
    ),
  );

  /** Replaces the `loadUserDetail` rxMethod. */
  loadUserDetail$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.loadUserDetail),
      switchMap(({ userId }) =>
        this.detailService.getUserDetailById(userId).pipe(
          map((userDetail: CreateUserDetailDto) => {
            localStorage.setItem(
              DETAIL_STORAGE_KEY,
              JSON.stringify(userDetail),
            );
            return UserActions.userDetailLoaded({ userDetail });
          }),
          catchError(() => {
            this.errorService.handleError(ErrorCodes.LOAD_PROFILE);
            return EMPTY;
          }),
        ),
      ),
    ),
  );

  /** Replaces the `refreshUser` rxMethod. */
  refreshUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.refreshUser),
      withLatestFrom(this.store.select(selectUser)),
      switchMap(([, currentUser]) => {
        const username = currentUser?.username;
        if (!username) return EMPTY;

        return this.authService.getUser(username).pipe(
          map((updatedUser) => {
            localStorage.setItem(
              USER_STORAGE_KEY,
              JSON.stringify(updatedUser),
            );
            return UserActions.userRefreshed({ user: updatedUser });
          }),
          catchError((err) => {
            this.errorService.handleError(ErrorCodes.REFRESH);
            console.error(err);
            return EMPTY;
          }),
        );
      }),
    ),
  );

  /** Replaces the backend call of the `toggleFavorite` rxMethod (optimistic update lives in the reducer). */
  syncFavorites$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(UserActions.toggleFavorite),
        // reducer runs before the effect, so selectUser reflects the optimistic update
        withLatestFrom(this.store.select(selectUser)),
        switchMap(([, user]) => {
          if (!user?.favorites) return EMPTY;
          return this.authService.updateUserFavorites(user.favorites);
        }),
      ),
    { dispatch: false },
  );
}