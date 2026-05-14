import { Component, HostListener, inject } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { ConfigurationService } from './services/configuration-service';
import { filter } from 'rxjs';
import { ScrollService } from './services/scroll-service';

@Component({
  imports: [RouterModule],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  router = inject(Router);
  scrollService = inject(ScrollService);
  config = inject(ConfigurationService);

  constructor() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.scrollService.scrollToTop();
      });
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    // Logic: Ctrl + Shift + D (for Dark mode toggle)
    if (event.ctrlKey && event.shiftKey && event.key === 'D') {
      event.preventDefault();
      this.config.toggleTheme();
    }
  }
}
