import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType, ROOT_EFFECTS_INIT } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import {
  catchError,
  distinctUntilChanged,
  EMPTY,
  filter,
  map,
  mergeMap,
  Observable,
  of,
  switchMap,
  tap,
} from 'rxjs';
import { withLatestFrom } from 'rxjs';
import { BookService } from '@service';
import { ErrorCodes, ErrorService, SuccessCodes } from '@core';
import { ActionResponse } from '@store/shared-models';
import {
  AppActions,
  AppStateRoot,
  SEARCH_HISTORY_KEY,
  selectAppFilters,
  selectSearchHistory,
} from './app-store';

@Injectable()
export class AppEffects {
  private actions$ = inject(Actions);
  private store = inject(Store<AppStateRoot>);
  private bookService = inject(BookService);
  private errorService = inject(ErrorService);
  private breakpointObserver = inject(BreakpointObserver);

  /**
   * NOTE on the trigger: starts on the built-in `ROOT_EFFECTS_INIT` action,
   * which NgRx dispatches once when root effects are registered — the NgRx
   * equivalent of a signal-store `onInit`. The `switchMap` then subscribes to
   * the `observe()` stream and keeps it alive, so this reacts to every
   * breakpoint change, not just the bootstrap one.
   *
   * This effect CANNOT be `{ dispatch: false }`: it output-dispatches
   * `setDeviceInfo`, which the reducer needs to update the store so
   * `selectIsMobile`/`selectIsTablet` stay correct. Compare with
   * `cart.effects.persistCart$`, which has no output action and therefore
   * uses `dispatch: false` (no `ofType` needed there).
   */
  /** Mirrors the legacy onInit BreakpointObserver wiring — starts automatically on bootstrap. */
  initDeviceInfo$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROOT_EFFECTS_INIT),
      switchMap(() =>
        this.breakpointObserver
          .observe([
            Breakpoints.XSmall,
            Breakpoints.Small,
            Breakpoints.Medium,
          ])
          .pipe(
            map((result) =>
              AppActions.setDeviceInfo({
                isMobile: result.breakpoints[Breakpoints.XSmall],
                isTablet:
                  result.breakpoints[Breakpoints.Small] ||
                  result.breakpoints[Breakpoints.Medium],
              }),
            ),
          ),
      ),
    ),
  );

  /** Replaces the legacy `productsResource` fetch. */
  loadProducts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AppActions.loadProducts),
      withLatestFrom(this.store.select(selectAppFilters)),
      switchMap(([, filters]) =>
        this.bookService.fetchProducts(filters).pipe(
          map((response) => AppActions.productsLoaded({ response })),
          catchError((error) => of(AppActions.productsLoadError({ error }))),
        ),
      ),
    ),
  );

  /** Replaces the `loadCustomProducts` method. */
  loadCustomProducts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AppActions.loadCustomProducts),
      withLatestFrom(this.store.select(selectAppFilters)),
      switchMap(([{ filters }, current]) =>
        this.bookService.fetchProducts({ ...current, ...filters }).pipe(
          map((response) => AppActions.customProductsLoaded({ response })),
          catchError((error) => of(AppActions.customProductsLoadError({ error }))),
        ),
      ),
    ),
  );

  /** Replaces the `deleteBook` rxMethod. */
  deleteProduct$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AppActions.deleteProduct),
      mergeMap(({ bookId }) =>
        this.bookService.delete(bookId).pipe(
          mergeMap((res: ActionResponse): Observable<never | ReturnType<typeof AppActions.productDeleted>> =>
            this.handleDeleteResponse(bookId, res),
          ),
          catchError(() => {
            this.errorService.handleError(ErrorCodes.PRODUCT_DELETE);
            return EMPTY;
          }),
        ),
      ),
    ),
  );

  /** Replaces the `saveBook` rxMethod. */
  saveProduct$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AppActions.saveProduct),
      mergeMap(({ id, data }) =>
        (id ? this.bookService.update(id, data) : this.bookService.create(data)).pipe(
          mergeMap(() => {
            const code = id
              ? SuccessCodes.PRODUCT_UPDATE
              : SuccessCodes.PRODUCT_CREATE;
            this.errorService.handleSuccess(code);
            return of(AppActions.productSaved({ id, data }));
          }),
          catchError((err) => {
            const code = id
              ? ErrorCodes.PRODUCT_UPDATE
              : ErrorCodes.PRODUCT_CREATE;
            this.errorService.handleError(code);
            console.error(err);
            return EMPTY;
          }),
        ),
      ),
    ),
  );

  /** Auto re-fetch after a successful create/update/delete (booksVersion bump). */
  reloadProductsOnMutation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AppActions.productDeleted, AppActions.productSaved),
      map(() => AppActions.loadProducts()),
    ),
  );

  /** Boots the products fetch when root effects initialize (the NgRx
   *  replacement for the signal store's initial rxResource request). */
  loadProductsOnBootstrap$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROOT_EFFECTS_INIT),
      map(() => AppActions.loadProducts()),
    ),
  );

  /** Mirrors the signal store's auto-refetch on filter/page/append changes:
   *  any request-mutating action re-runs the products fetch. The storage
   *  reducers set `productsLoading: true` atomically with those actions, so
   *  the accumulator gate stays closed (no stale pages) while fetching. */
  reloadProductsOnRequest$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        AppActions.updateFilters,
        AppActions.loadMore,
        AppActions.setPage,
        AppActions.toggleSort,
      ),
      map(() => AppActions.loadProducts()),
    ),
  );

  /** Persist the search history in LocalStorage (side effect kept out of the reducer). */
  persistSearchHistory$ = createEffect(
    () =>
      this.store.select(selectSearchHistory).pipe(
        filter((history) => history.length > 0),
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
        tap((history) =>
          localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history)),
        ),
      ),
    { dispatch: false },
  );

  private handleDeleteResponse(
    bookId: string,
    res: ActionResponse,
  ): Observable<never | ReturnType<typeof AppActions.productDeleted>> {
    if (res.warning) {
      this.errorService.handleError(ErrorCodes.PRODUCT_DELETE);
      return EMPTY;
    }
    this.errorService.handleSuccess(SuccessCodes.PRODUCT_DELETE);
    return of(AppActions.productDeleted({ bookId }));
  }
}