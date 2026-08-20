import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AppStore, UserStore } from '@store';
import { AuthService, ToastService } from '@service';

const USER_STORAGE_KEY = 'currentUser';
const TOKEN_STORAGE_KEY = 'accessToken';
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
  private readonly savedToken: string | null;
  private readonly savedDetail: string | null;
  private readonly searchHistory: string | null;

  constructor() {
    this.savedUser = localStorage.getItem(USER_STORAGE_KEY);
    this.savedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
    this.savedDetail = localStorage.getItem(DETAIL_STORAGE_KEY);
    this.searchHistory = localStorage.getItem(SEARCH_HISTORY_KEY);
  }

  async main(): Promise<boolean> {
    if (!this.savedToken) {
      this.userStore.invalidateUser();
      this.toastService.alert('Token is missing!');
      return false;
    }

    this.restoreFromStorage();

    try {
      if (this.savedUser) {
        const username = JSON.parse(this.savedUser).username;
        const validUser = await firstValueFrom(
          this.authService.getUser(username),
        );
        if (validUser) {
          this.userStore.updateStore(validUser, null, null);
          return true;
        }
      }
      this.toastService.alert('Token is invalid!');
      return false;
    } catch {
      this.toastService.alert('Token is invalid!');
      return false;
    }
  }

  private restoreFromStorage() {
    if (this.savedUser && this.savedToken) {
      this.userStore.updateStore(JSON.parse(this.savedUser), null, null);
      this.appStore.setToken(this.savedToken);

      if (this.searchHistory) {
        this.appStore.setHistory(JSON.parse(this.searchHistory));
      }

      if (this.savedDetail) {
        this.userStore.updateStore(null, JSON.parse(this.savedDetail), null);
      }
    }
  }
}