/**
 * ============================================================================
 * CLASSIC NgRx EFFECTS - Cart (side-effect layer for cart-classic-store.ts)
 * ============================================================================
 *
 * Effects are the classic home for ALL side effects (HTTP calls, timers,
 * localStorage, logging...). They listen to the stream of dispatched actions
 * (`this.actions$`), perform work, and dispatch NEW actions back into the
 * store. Reducers stay pure - they just consume the result actions.
 *
 * Flow diagram:
 *
 *   Component            Effect                     API              Reducer
 *      |                    |                         |                 |
 *      |-- loadOrders ----->|                         |                 |
 *      |                    |-- getUserOrders() ----->|                 |
 *      |                    |<---- CreatedOrder[] ----|                 |
 *      |                    |-- loadOrdersSuccess ------------------->  |
 *      |                                              |          new state
 *
 * This replaces the `rxMethod` blocks inside `withMethods` of the original
 * SignalStore (see cart-store.ts: reloadOrders / syncCartWithServer).
 *
 * Registration (NOT wired anywhere yet):
 *   - NgModule apps:     EffectsModule.forFeature([ClassicCartEffects])
 *   - Standalone APIs:   provideEffects(ClassicCartEffects)
 */

import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { catchError, map, switchMap, withLatestFrom } from 'rxjs';

import { BookService, OrderService } from '@service';
import {
  loadOrders,
  loadOrdersFail,
  loadOrdersSuccess,
  selectItems,
  syncCartFail,
  syncCartStart,
  syncCartSuccess,
} from './cart-classic-store';

@Injectable()
export class ClassicCartEffects {
  /** Hot observable of every action flowing through the app. */
  private actions$ = inject(Actions);

  /** Read access to current state (classic way to "peek" into the store). */
  private store = inject(Store);

  private bookService = inject(BookService);
  private orderService = inject(OrderService);

  /**
   * Load user's orders from the API.
   *
   * Trigger:  `loadOrders({ userId })`
   * Success:  `loadOrdersSuccess({ orders })`  -> reducer stores them
   * Failure:  `loadOrdersFail()`               -> reducer resets isLoading
   *
   * `switchMap` cancels the previous in-flight request if a new one arrives -
   * exactly what the original `rxMethod(pipe(tap, switchMap(...)))` did.
   */
  loadOrders$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadOrders),
      switchMap(({ userId }) =>
        this.orderService.getUserOrders(userId).pipe(
          // map success/error into actions. catchError(of(...)) swallows the
          // HTTP error so the actions$ stream never breaks (a broken stream
          // would permanently kill all effects).
          map((orders) => loadOrdersSuccess({ orders })),
          catchError(() => of(loadOrdersFail())),
        ),
      ),
    ),
  );

  /**
   * Sync cart prices/discounts with the server.
   *
   * Trigger:  `syncCartStart` (no payload)
   * Reads:    current item ids straight from the store via `withLatestFrom`
   *           - this is how classic NgRx combines action payload + state.
   * Success:  `syncCartSuccess({ freshBooks })` -> reducer diffs prices,
   *           updates changed products and drops deleted ones.
   * Failure:  `syncCartFail()`
   */
  syncCartWithServer$ = createEffect(() =>
    this.actions$.pipe(
      ofType(syncCartStart),
      // Grab the freshest cart snapshot at the moment the action fires.
      withLatestFrom(this.store.select(selectItems)),
      // Parity with the original guard: `if (ids.length === 0) return;`
      // (filtering here means NO request and NO result action is emitted).
      switchMap(([, items]) => {
        const ids = items.map((item) => item.product.id);

        return this.bookService.getFavorites(ids).pipe(
          map((freshBooks) => syncCartSuccess({ freshBooks })),
          catchError(() => of(syncCartFail())),
        );
      }),
    ),
  );
}
