import {
  Component,
  computed,
  inject,
  signal,
  PLATFORM_ID,
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
} from '@lucide/angular';
import { NoBtnHoverDirective } from '../../core/no-btn-hover.directive';
import { NoFocusJumpDirective } from '../../core/no-focus-jump.directive';
import { ScrollService } from '../../services/scroll-service';

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
    NoFocusJumpDirective,
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  private translocoService = inject(TranslocoService);
  config = inject(ConfigurationService);
  scroller = inject(ScrollService);
  private router = inject(Router);
  private store = inject(AppStore);
  cartStore = inject(CartStore);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  modelUsername = '';
  // Existing signals
  isPremium = computed(() => this.store.premiumStatus()?.isPremium ?? true);
  userAvatar = computed(() => this.store.user()?.avatarUrl);
  isLoggedIn = computed(() => this.store.isLoggedIn());

  userName = this.store.user;
  isAdmin = this.store.isAdmin;
  searchQuery = signal('');
  protected showLoginModal = signal(false);
  showSearchbar = computed(() => this.config.flags().SHOW_SEARCHBAR_HEADER);

  // Convert the lang changes to a signal
  activeLang = toSignal(this.translocoService.langChanges$, {
    initialValue: this.translocoService.getActiveLang(),
  });

  // Toggle function
  toggleLang() {
    console.log(this.isPremium());
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

  handleLogin() {
    this.showLoginModal.set(true);
  }

  handleLogout() {
    this.store.logout();
    this.cartStore.clearCart(); // Wipe the cart logic
    this.router.navigate(['/']);
  }

  onLoginSubmit(event: Event) {
    event.preventDefault();
    // Logic for auth goes here...
    if (this.modelUsername.trim() !== '') {
      this.store.login({
        username: this.modelUsername,
        onSuccess: () => this.showLoginModal.set(false),
      });
    }
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
