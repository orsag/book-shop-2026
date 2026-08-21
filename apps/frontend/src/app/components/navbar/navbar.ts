import {
  Component,
  computed,
  inject,
  signal,
  PLATFORM_ID,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  CommonModule,
  NgOptimizedImage,
  isPlatformBrowser,
} from '@angular/common';
import { ThemePicker } from '../theme-picker/theme-picker';
import { ConfigurationService, ScrollService } from '@service';
import { AppStore, CartStore, UserStore } from '@store';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import {
  TooltipDirective,
  NoBtnHoverDirective,
  RedFocusDirective,
  BlueFocusDirective,
} from '@core';
import { toSignal, takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
import { debounceTime, distinctUntilChanged, filter, map, tap } from 'rxjs';

@Component({
  selector: 'app-navbar',
  imports: [
    CommonModule,
    RouterLink,
    ThemePicker,
    NgOptimizedImage,
    ReactiveFormsModule,
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
    RedFocusDirective,
    BlueFocusDirective,
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

  onClearSearchbar(): void {
    this.searchControl.setValue('');
    this.store.updateFilters({ search: '' });
  }
}
