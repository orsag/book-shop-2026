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
import { ConfigurationService } from '../../services/configuration-service';
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
import { NoBtnHoverDirective } from '../../core/no-btn-hover.directive';
import { ScrollService } from '../../services/scroll-service';
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
  showSearchbar = computed(() => this.config.flags().SHOW_SEARCHBAR_HEADER);

  // Convert the lang changes to a signal
  activeLang = toSignal(this.translocoService.langChanges$, {
    initialValue: this.translocoService.getActiveLang(),
  });

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
    const value = input.value;

    // 1. Update the local UI signal
    this.searchQuery.set(value);

    // 2. Update ONLY the search parameter in the store
    this.store.updateFilters({
      search: value,
    });
    this.store.addToHistory(value);

    const allowedRoutes = ['/', '/home', '/administration'];

    if (allowedRoutes.includes(this.router.url)) {
      this.scroller.scrollToTop();
    } else {
      this.router.navigate(['/']);
    }
  }

  onClearSearchbar(): void {
    this.searchQuery.set('');
    this.store.updateFilters({
      search: this.searchQuery(),
    });
  }
}
