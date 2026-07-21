import {
  Component,
  computed,
  inject,
  signal,
  PLATFORM_ID,
  ViewChild,
  ElementRef,
  effect,
  untracked,
  debounced,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  CommonModule,
  NgOptimizedImage,
  isPlatformBrowser,
} from '@angular/common';
import { ThemePicker } from '../theme-picker/theme-picker';
import { ConfigurationService, ScrollService } from '@service';
import { AppStore } from '../../store/app-store';
import { FormsModule } from '@angular/forms';
import { CartStore } from '../../store/cart-store';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import { toSignal } from '@angular/core/rxjs-interop';
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
import { TooltipDirective, NoBtnHoverDirective } from '@core';
import { UserStore } from '../../store/user-store';

@Component({
  selector: 'app-navbar',
  imports: [
    CommonModule,
    RouterLink,
    ThemePicker,
    NgOptimizedImage,
    FormsModule,
    TranslocoDirective,
    LucideLogIn,
    LucideLogOut,
    LucideLanguages,
    LucideShoppingBasket,
    NoBtnHoverDirective,
    LucideSparkles,
    LucideUser,
    LucideX,
    LucideMenu,
    LucideLayoutDashboard,
    TooltipDirective,
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  private translocoService = inject(TranslocoService);
  config = inject(ConfigurationService);
  scroller = inject(ScrollService);
  router = inject(Router);
  store = inject(AppStore);
  userStore = inject(UserStore);
  cartStore = inject(CartStore);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);
  showProfileModal = signal(false);
  @ViewChild('myInput') inputElement!: ElementRef<HTMLInputElement>;
  currentTheme = this.config.theme;

  currentNavbarBackground = computed(() =>
    this.config.theme() === 'dark'
      ? '/images/navbarDark.svg'
      : '/images/navbarLight.svg',
  );

  // Existing signals
  isPremium = computed(() => this.userStore.premiumStatus()?.isPremium ?? true);
  isLoggedIn = computed(() => this.userStore.isLoggedIn());

  userName = this.userStore.user;
  isAdmin = this.userStore.isAdmin;
  searchQuery = signal('');
  debouncedSearchQuery = debounced(this.searchQuery, 500);
  showSearchbar = computed(() => this.config.flags().SHOW_SEARCHBAR_HEADER);

  // Convert the lang changes to a signal
  activeLang = toSignal(this.translocoService.langChanges$, {
    initialValue: this.translocoService.getActiveLang(),
  });

  constructor() {
    // 3. React to debounced changes safely
    effect(() => {
      const query = this.debouncedSearchQuery.value();

      untracked(() => {
        const storeSearch = this.store.filters().search;

        // Compare against store to avoid redundant updates/navigations
        if (query !== storeSearch) {
          this.store.updateFilters({ search: query });

          if (query.trim()) {
            this.store.addToHistory(query);
          }

          const allowedRoutes = ['/', '/home', '/administration'];
          if (allowedRoutes.includes(this.router.url)) {
            this.scroller.scrollToTop();
          } else {
            this.router.navigate(['/']);
          }
        }
      });
    });
  }

  // Toggle function
  toggleLang() {
    const newLang = this.activeLang() === 'en' ? 'sk' : 'en';
    this.translocoService.setActiveLang(newLang);
  }

  logoutMenuItem(event: PointerEvent): void {
    this.closeDropdown(event);
    this.handleLogout();
  }

  readonly isRotating = signal(false);

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
    } else {
      // Or more aggressively:
      if (this.isBrowser) {
        (document.activeElement as HTMLElement)?.blur();
      }
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

  // Handle the input event
  onSearchChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  onClearSearchbar(): void {
    this.searchQuery.set('');
    this.store.updateFilters({
      search: this.searchQuery(),
    });
  }
}
