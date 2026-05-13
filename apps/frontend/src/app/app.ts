import { Component, HostListener, inject } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { ConfigurationService } from './services/configuration-service';
import { filter } from 'rxjs';
import { ScrollService } from './services/scroll-service';
import { AppStore } from './store/app-store';

@Component({
  imports: [RouterModule],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  router = inject(Router);
  store = inject(AppStore);
  scrollService = inject(ScrollService);
  config = inject(ConfigurationService);

  constructor() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.scrollService.scrollToTop();
        if (event.urlAfterRedirects.includes('/profile')) {
          this.handleOrderReloading(true);
        }
        if (event.urlAfterRedirects.includes('/administration')) {
          // Dispatch admin-level global refreshes here
          if (this.store.isAdmin()) {
            this.handleOrderReloading();
          }
        }
      });
  }

  handleOrderReloading(userDetail = false) {
    const userId = this.store.user()?.id;
    if (userId) {
      if (userDetail) {
        this.store.loadUserDetail({ userId });
      }
      this.store.reloadOrders({ userId });
    }
  };

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    // Logic: Ctrl + Shift + D (for Dark mode toggle)
    if (event.ctrlKey && event.shiftKey && event.key === 'D') {
      event.preventDefault();
      this.config.toggleTheme();
    }
  }
}
