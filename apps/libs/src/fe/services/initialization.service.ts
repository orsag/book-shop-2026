import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AppStore, UserStore } from '@store';
import { AuthService, ToastService } from '@service';

const USER_STORAGE_KEY = 'currentUser';
const DETAIL_STORAGE_KEY = 'currentStatus';
const SEARCH_HISTORY_KEY = 'searchHistory';

@Injectable({
  providedIn: 'root',
})
export class InitializationService {
  private userStore = inject(UserStore);
  private appStore = inject(AppStore);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

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
      this.userStore.invalidateUser();
      return false;
    }

    const parsed = JSON.parse(this.savedUser);

    try {
      const validUser = await firstValueFrom(
        this.authService.getUser(parsed.username),
      );
      if (validUser) {
        this.userStore.updateStore('user', validUser);
        this.restoreFromStorage();
        return true;
      }
    } catch {
      this.toastService.alert('Session expired. Please log in again.');
      // this.clearStorage();
      this.userStore.invalidateUser();
      return false;
    }

    this.userStore.invalidateUser();
    return false;
  }

  private restoreFromStorage() {
    if (this.searchHistory) {
      this.appStore.setHistory(JSON.parse(this.searchHistory));
    }

    if (this.savedDetail) {
      this.userStore.updateStore('userDetail', JSON.parse(this.savedDetail));
    }
  }

  private clearStorage() {
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(DETAIL_STORAGE_KEY);
    localStorage.removeItem(SEARCH_HISTORY_KEY);
  }
}
