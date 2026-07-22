import {
  Component,
  effect,
  Input,
  linkedSignal,
  signal,
  untracked,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfigurationService, ScrollService } from '@service';
import { inject, debounced, SimpleChanges } from '@angular/core';
import { BookFilters } from '../../../types';
import { AppStore } from '@store';
import { CATEGORIES, VIEW_LAYOUTS } from '@store/shared-models';
import { TranslocoDirective, TranslocoPipe } from '@jsverse/transloco';
import { Router } from '@angular/router';
import { NoFocusJumpDirective } from '@core';
import {
  LucideArrowDownNarrowWide,
  LucideArrowUpWideNarrow,
  LucideGrid3x3,
  LucideList,
  LucidePercent,
  LucideSearch,
} from '@lucide/angular';

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
    LucidePercent,
  ],
  templateUrl: './filter.html',
  styleUrl: './filter.css',
})
export class Filter {
  store = inject(AppStore);
  router = inject(Router);
  config = inject(ConfigurationService);
  scroller = inject(ScrollService);
  bookCategories = CATEGORIES;

  showHistory = signal(false);
  @Input() isCollapsed = false;
  activeIndex = signal(-1); // For keyboard navigation
  private openTimeout: any;

  isContentVisible = signal(false);
  // Initialize from store instead of hardcoded defaults
  filters = linkedSignal<BookFilters>(() => {
    const f = this.store.filters();
    return {
      type: f.type,
      search: f.search,
      category: f.category,
      isDiscounted: f.isDiscounted,
    };
  });

  debouncedFilters = debounced(this.filters, 500);

  constructor() {
    effect(() => {
      const debouncedVal = this.debouncedFilters.value();
      if (!debouncedVal.search) return;

      untracked(() => {
        // Compare with store to avoid redundant submits when store and filters are identical
        const storeFilters = this.store.filters();
        const hasChanged = debouncedVal.search !== storeFilters.search;

        if (hasChanged && !this.store.isMobile()) {
          this.store.updateFilters(debouncedVal);
          this.store.addToHistory(debouncedVal.search);
          this.scroller.scrollToTop();
        }
      });
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isCollapsed']) {
      const collapsed = changes['isCollapsed'].currentValue;

      // Clear any pending opening timeouts to prevent race conditions
      if (this.openTimeout) {
        clearTimeout(this.openTimeout);
      }

      if (collapsed) {
        // 1. Shrinking begins: Remove content IMMEDIATELY
        this.isContentVisible.set(false);
      } else {
        // 2. Opening begins: Wait for the 300ms CSS animation to finish
        this.openTimeout = setTimeout(() => {
          this.isContentVisible.set(true);
        }, 300); // Matches your transition-all duration-300
      }
    }
  }

  // Update helper
  updateFilter<K extends keyof BookFilters>(key: K, value: BookFilters[K]) {
    this.filters.update((f) => ({ ...f, [key]: value }));
    if (key === 'type' || key === 'isDiscounted') {
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

    if (this.store.isMobile()) {
      this.config.toggleFlag('SHOW_FILTER');
    }
  }

  protected readonly VIEW_LAYOUTS = VIEW_LAYOUTS;
}
