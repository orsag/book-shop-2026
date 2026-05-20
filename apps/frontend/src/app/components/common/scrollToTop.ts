import {
  Component,
  signal,
  effect,
  computed,
  inject,
  PLATFORM_ID,
} from '@angular/core';
import { LucideArrowBigUp } from '@lucide/angular';
import { ConfigurationService } from '../../services/configuration-service';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-scroll-btn',
  standalone: true,
  imports: [LucideArrowBigUp],
  template: `
    <button
      (click)="scrollToTop()"
      [class.opacity-100]="isVisible()"
      [class.opacity-0]="!isVisible()"
      [class.pointer-events-none]="!isVisible()"
      class="btn btn-circle btn-primary btn-lg shadow-xl fixed bottom-8 right-8
      z-50 transition-transform hover:scale-110 active:scale-95 hover:ring-4 hover:ring-primary/30"
    >
      <svg lucideArrowBigUp size="30"></svg>
    </button>
  `,
})
export class ScrollBtnComponent {
  isVisible = signal(false);
  private config = inject(ConfigurationService);
  showFilter = computed(() => this.config.flags().SHOW_FILTER);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  constructor() {
    effect((onCleanup) => {
      if (!this.isBrowser) {
        return;
      }
      // 1. Grab the new scrolling container by its ID
      const scrollArea = document.getElementById('main-scroll-area');

      if (!scrollArea) return; // Safety check

      const onScroll = () => {
        if (!this.showFilter()) {
          // 2. Use .scrollTop instead of window.scrollY
          this.isVisible.set(scrollArea.scrollTop > 300);
        }
      };

      // 3. Attach the event listener to the div, not the window
      scrollArea.addEventListener('scroll', onScroll);

      onCleanup(() => scrollArea.removeEventListener('scroll', onScroll));
    });
  }

  scrollToTop() {
    const scrollArea = document.getElementById('main-scroll-area');

    if (scrollArea) {
      // 4. Scroll the specific div back to the top
      scrollArea.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  }
}
