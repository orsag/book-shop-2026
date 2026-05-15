import { Component, effect, signal } from '@angular/core';
import { ConfigurationService } from '../../services/configuration-service';
import { inject, computed } from '@angular/core';
import { BookFilters } from '../../../types';
import { AppStore } from '../../store/app-store';
import { CATEGORIES } from '@store/shared-models';
import { TranslocoDirective, TranslocoPipe } from '@jsverse/transloco';
import { Router } from '@angular/router';
import { ScrollService } from '../../services/scroll-service';
import { NoFocusJumpDirective } from '../../core/no-focus-jump.directive';
import {
  LucideArrowDownNarrowWide,
  LucideArrowUpWideNarrow,
  LucideGrid3x3,
  LucideList,
  LucideSearch,
} from '@lucide/angular';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map } from 'rxjs';

@Component({
  selector: 'app-filter',
  imports: [
    LucideSearch,
    TranslocoDirective,
    TranslocoPipe,
    NoFocusJumpDirective,
    CommonModule,
    LucideGrid3x3,
    LucideList,
    LucideArrowDownNarrowWide,
    LucideArrowUpWideNarrow,
  ],
  templateUrl: './filter.html',
  styleUrl: './filter.css',
})
export class Filter {
  private breakpointObserver = inject(BreakpointObserver);
  store = inject(AppStore);
  router = inject(Router);
  config = inject(ConfigurationService);
  scroller = inject(ScrollService);
  bookCategories = CATEGORIES;

  showFilter = computed(() => this.config.flags().SHOW_FILTER);
  isCoolingDown = signal(false);
  showHistory = signal(false);
  activeIndex = signal(-1); // For keyboard navigation
  toggles = [
    //   { key: 'isAvailable', label: 'available' },
    //   { key: 'isNewRelease', label: 'newReleases' },
    { key: 'isDiscounted', label: 'discounted' },
    //   { key: 'isBestSeller', label: 'bestsellers' },
  ] as const;

  // Initialize from store instead of hardcoded defaults
  filters = signal<BookFilters>({
    type: 'BOOK',
    search: '',
    category: null,
    isDiscounted: false,
  });

  constructor() {
    // Create a reactive link
    effect(() => {
      this.filters.set({
        type: this.store.filters.type(),
        search: this.store.filters.search(),
        category: this.store.filters.category(),
        isDiscounted: this.store.filters.isDiscounted(),
      });
    });
  }

  isHandset = toSignal(
    this.breakpointObserver
      .observe(Breakpoints.Handset)
      .pipe(map((result) => result.matches)),
    { initialValue: false },
  );

  // Update helper
  updateFilter<K extends keyof BookFilters>(key: K, value: BookFilters[K]) {
    this.filters.update((f) => ({ ...f, [key]: value }));
    if (key === 'type') {
      this.onSubmit();
    }
  }

  selectHistory(term: string) {
    this.updateFilter('search', term);
    this.showHistory.set(false);
    this.onSubmit(); // Auto-submit when picking from history
  }

  onKeyDown(event: KeyboardEvent) {
    const history = this.store.searchHistory();
    if (!this.showHistory() || history.length === 0) return;

    if (event.key === 'ArrowDown') {
      this.activeIndex.update((i) => (i < history.length - 1 ? i + 1 : i));
    } else if (event.key === 'ArrowUp') {
      this.activeIndex.update((i) => (i > 0 ? i - 1 : 0));
    } else if (event.key === 'Enter' && this.activeIndex() !== -1) {
      event.preventDefault();
      this.selectHistory(history[this.activeIndex()]);
    } else if (event.key === 'Escape') {
      this.showHistory.set(false);
    }
  }

  onSubmit() {
    this.store.updateFilters(this.filters());
    this.store.addToHistory(this.filters().search);

    const allowedRoutes = ['/', '/home', '/administration'];

    if (allowedRoutes.includes(this.router.url)) {
      this.scroller.scrollToTop();
    } else {
      this.router.navigate(['/']);
    }

    if (this.isHandset()) {
      this.config.toggleFlag('SHOW_FILTER');
    }
  }
}
