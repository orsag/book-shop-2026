import { Component, HostListener, inject, PLATFORM_ID } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { ConfigurationService } from './services/configuration-service';
import { ScrollService } from './services/scroll-service';
import { isPlatformBrowser } from '@angular/common';
import { GradientBgComponent } from './components/common/gradient-bg.component';
import { filter } from 'rxjs';

@Component({
  imports: [RouterModule, GradientBgComponent],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  router = inject(Router);
  scrollService = inject(ScrollService);
  config = inject(ConfigurationService);
  private platformId = inject(PLATFORM_ID);

  constructor() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        if (isPlatformBrowser(this.platformId)) {
          this.scrollService.scrollToTop();
        }
      });
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    // Logic: Ctrl + Shift + D (for Dark mode toggle)
    if (event.ctrlKey && event.shiftKey && event.key === 'D') {
      event.preventDefault();
      this.config.toggleTheme();
    }
  }
}
