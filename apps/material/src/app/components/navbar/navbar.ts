import {
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ThemePicker } from '../theme-picker/theme-picker';
import { ConfigurationService, ScrollService } from '@service';
import { Store } from '@ngrx/store';
import {
  AppActions,
  AppStateRoot,
  CartActions,
  CartStateRoot,
  Filters,
  UserActions,
  UserStateRoot,
  selectAppFilters,
  selectIsAdmin,
  selectIsLoggedIn,
  selectItemCount,
  selectPremiumStatus,
  selectUser,
} from '@ngrx';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import { toSignal, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, filter, map, tap } from 'rxjs';
import { MatToolbar } from '@angular/material/toolbar';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatBadge } from '@angular/material/badge';
import {
  MatMenu,
  MatMenuItem,
  MatMenuTrigger,
} from '@angular/material/menu';
import {
  LucideLogIn,
  LucideLogOut,
  LucideLanguages,
  LucideShoppingBasket,
  LucideSparkles,
  LucideUser,
  LucideLayoutDashboard,
  LucideX,
  LucideMenu,
} from '@lucide/angular';

@Component({
  selector: 'app-navbar',
  imports: [
    CommonModule,
    RouterLink,
    ThemePicker,
    ReactiveFormsModule,
    TranslocoDirective,
    MatToolbar,
    MatIconButton,
    MatTooltip,
    MatBadge,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    LucideLogIn,
    LucideLogOut,
    LucideLanguages,
    LucideShoppingBasket,
    LucideSparkles,
    LucideUser,
    LucideX,
    LucideMenu,
    LucideLayoutDashboard,
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  private translocoService = inject(TranslocoService);
  config = inject(ConfigurationService);
  scroller = inject(ScrollService);
  router = inject(Router);
  private readonly appStore = inject(
    Store<AppStateRoot & CartStateRoot & UserStateRoot>,
  );

  readonly store = {
    filters: this.appStore.selectSignal(selectAppFilters),
    updateFilters: (partial: Partial<Filters>) =>
      this.appStore.dispatch(AppActions.updateFilters({ partial })),
    addToHistory: (searchTerm: string) =>
      this.appStore.dispatch(AppActions.addToHistory({ searchTerm })),
  };

  readonly cartStore = {
    itemCount: this.appStore.selectSignal(selectItemCount),
    clearCart: () => this.appStore.dispatch(CartActions.clearCart()),
  };

  readonly userStore = {
    user: this.appStore.selectSignal(selectUser),
    isLoggedIn: this.appStore.selectSignal(selectIsLoggedIn),
    isAdmin: this.appStore.selectSignal(selectIsAdmin),
    premiumStatus: this.appStore.selectSignal(selectPremiumStatus),
    logout: () => this.appStore.dispatch(UserActions.logout()),
  };

  currentTheme = this.config.theme;

  currentNavbarBackground = computed(() =>
    this.config.isDarkTheme()
      ? '/images/navbarDark.svg'
      : '/images/navbarLight.svg',
  );

  // Existing signals
  isPremium = computed(() => this.userStore.premiumStatus()?.isPremium ?? true);
  isLoggedIn = computed(() => this.userStore.isLoggedIn());

  userName = this.userStore.user;
  isAdmin = this.userStore.isAdmin;
  searchControl = new FormControl('', { nonNullable: true });
  showSearchbar = computed(() => true); // this.config.flags().SHOW_SEARCHBAR_HEADER

  // Convert the lang changes to a signal
  activeLang = toSignal(this.translocoService.langChanges$, {
    initialValue: this.translocoService.getActiveLang(),
  });

  readonly isRotating = signal(false);

  constructor() {
    this.searchControl.valueChanges
      .pipe(
        map((search) => search.trim()),
        debounceTime(500),
        distinctUntilChanged(),
        filter((search) => search !== this.store.filters().search),
        tap((search) => {
          this.store.updateFilters({ search });

          if (search) {
            this.store.addToHistory(search);
          }

          const allowedRoutes = ['/', '/home', '/administration'];
          if (allowedRoutes.includes(this.router.url)) {
            this.scroller.scrollToTop();
          } else {
            this.router.navigate(['/']);
          }
        }),
        takeUntilDestroyed(),
      )
      .subscribe();
  }

  // Toggle function
  toggleLang() {
    const newLang = this.activeLang() === 'en' ? 'sk' : 'en';
    this.translocoService.setActiveLang(newLang);
  }

  logoutMenuItem(event: Event): void {
    this.closeDropdown(event as PointerEvent);
    this.handleLogout();
  }

  handleButtonClick(skip = false) {
    if (!skip) {
      this.toggleSearchbar();
    }

    if (!this.isRotating()) {
      this.isRotating.set(true);

      // Match this timeout to your CSS transition duration
      setTimeout(() => {
        this.isRotating.set(false);
      }, 1000);
    }
  }

  toggleSearchbar(): void {
    const allowedRoutes = ['/', '/home', '/administration'];
    if (allowedRoutes.includes(this.router.url)) {
      this.config.toggleFlag('SHOW_FILTER');
    } else {
      this.router.navigate(['/']);
    }
  }

  closeDropdown(event: PointerEvent) {
    const el = event.currentTarget;
    if (el instanceof HTMLElement) {
      el.blur();
    }
  }

  handleAuthAction() {
    if (this.userStore.isLoggedIn()) {
      this.userStore.logout();
    } else {
      this.router.navigate(['/login']);
    }
  }

  handleLogout() {
    this.userStore.logout();
    this.cartStore.clearCart(); // Wipe the cart logic
    this.router.navigate(['/']);
  }

  onClearSearchbar(): void {
    this.searchControl.setValue('');
    this.store.updateFilters({ search: '' });
  }
}