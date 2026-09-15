import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { firstValueFrom } from 'rxjs';
import { AuthService, ToastService } from '@service';
import {
  AppActions,
  DETAIL_STORAGE_KEY,
  SEARCH_HISTORY_KEY,
  USER_STORAGE_KEY,
  UserActions,
} from '@ngrx';

/**
 * Material-local session restorer (NgRx-based replacement for the shared
 * `@service` InitializationService, which stays signal-store based for the
 * legacy frontend app). Only consumed by the single `provideAppInitializer`
 * in app.config.ts: reads the persisted session/history from LocalStorage,
 * validates the user against the backend, then hydrates the NgRx user/app
 * state directly. Reducer-only actions are dispatched here (no effect
 * listens to them), so timing against the Effects subscription is irrelevant.
 */
@Injectable({ providedIn: 'root' })
export class InitializationService {
  private readonly store = inject(Store);
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);

  private readonly savedUser: string | null;
  private readonly savedDetail: string | null;
  private readonly searchHistory: string | null;

  constructor() {
    this.savedUser = localStorage.getItem(USER_STORAGE_KEY);
    this.savedDetail = localStorage.getItem(DETAIL_STORAGE_KEY);
    this.searchHistory = localStorage.getItem(SEARCH_HISTORY_KEY);
  }

  async main(): Promise<boolean> {
    if (!this.savedUser) {
      this.store.dispatch(UserActions.invalidateUser());
      return false;
    }

    const parsed = JSON.parse(this.savedUser);

    try {
      const validUser = await firstValueFrom(
        this.authService.getUser(parsed.username),
      );
      if (validUser) {
        this.store.dispatch(UserActions.userRefreshed({ user: validUser }));
        this.restoreFromStorage();
        return true;
      }
    } catch {
      this.toastService.alert('Session expired. Please log in again.');
      this.store.dispatch(UserActions.invalidateUser());
      return false;
    }

    this.store.dispatch(UserActions.invalidateUser());
    return false;
  }

  private restoreFromStorage() {
    if (this.searchHistory) {
      this.store.dispatch(
        AppActions.setHistory({ searchHistory: JSON.parse(this.searchHistory) }),
      );
    }

    if (this.savedDetail) {
      this.store.dispatch(
        UserActions.userDetailLoaded({
          userDetail: JSON.parse(this.savedDetail),
        }),
      );
    }
  }
}