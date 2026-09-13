import {
  Component,
  effect,
  inject,
  linkedSignal,
  signal,
  untracked,
  computed,
} from '@angular/core';
import { debounced } from '@angular/core';
import { ConfigurationService, ScrollService } from '@service';
import { BookFilters, CATEGORIES, VIEW_LAYOUTS, ViewLayout } from '@store/libs';
import { TranslocoDirective } from '@jsverse/transloco';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import {
  AppActions,
  AppStateRoot,
  Filters,
  selectAppFilters,
  selectIsBook,
  selectIsMobile,
  selectProducts,
  selectSearchHistory,
  selectTotalProducts,
  selectViewLayout,
} from '@ngrx';
import {
  LucideArrowDownNarrowWide,
  LucideArrowUpWideNarrow,
  LucideGrid3x3,
  LucideList,
  LucidePercent,
  LucideSearch,
} from '@lucide/angular';
import { MatButton, MatIconButton } from '@angular/material/button';
import {
  MatButtonToggle,
  MatButtonToggleGroup,
} from '@angular/material/button-toggle';
import { MatFormField, MatHint, MatPrefix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';

@Component({
  selector: 'app-filter',
  imports: [
    TranslocoDirective,
    MatButton,
    MatButtonToggle,
    MatButtonToggleGroup,
    MatFormField,
    MatPrefix,
    MatInput,
    MatRadioButton,
    MatRadioGroup,
    LucideSearch,
    LucideGrid3x3,
    LucideList,
    LucideArrowDownNarrowWide,
    LucideArrowUpWideNarrow,
    LucidePercent,
    MatIconButton,
    MatHint,
  ],
  templateUrl: './filter.html',
  styleUrl: './filter.css',
})
export class Filter {
  router = inject(Router);
  config = inject(ConfigurationService);
  scroller = inject(ScrollService);
  private readonly appStore = inject(Store<AppStateRoot>);
  bookCategories = CATEGORIES;

  readonly store = {
    filters: this.appStore.selectSignal(selectAppFilters),
    isMobile: this.appStore.selectSignal(selectIsMobile),
    isBook: this.appStore.selectSignal(selectIsBook),
    viewLayout: this.appStore.selectSignal(selectViewLayout),
    searchHistory: this.appStore.selectSignal(selectSearchHistory),
    products: this.appStore.selectSignal(selectProducts),
    totalProducts: this.appStore.selectSignal(selectTotalProducts),
    updateFilters: (partial: Partial<Filters>) =>
      this.appStore.dispatch(AppActions.updateFilters({ partial })),
    addToHistory: (searchTerm: string) =>
      this.appStore.dispatch(AppActions.addToHistory({ searchTerm })),
    setViewLayout: (layout: ViewLayout) =>
      this.appStore.dispatch(AppActions.setViewLayout({ layout })),
    toggleSort: (sortType: 'price' | null) =>
      this.appStore.dispatch(AppActions.toggleSort({ sortType })),
  };

  showHistory = signal(false);
  activeIndex = signal(-1); // For keyboard navigation
  private openTimeout: ReturnType<typeof setTimeout> | null = null;

  showFilter = computed(() => this.config.flags().SHOW_FILTER);

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
      const collapsed = this.showFilter();

      untracked(() => {
        if (this.showFilter()) {
          if (this.openTimeout) {
            clearTimeout(this.openTimeout);
            this.openTimeout = null;
          }
        }

        if (collapsed) {
          // 1. Shrinking begins: Remove content IMMEDIATELY
          this.isContentVisible.set(false);
        } else {
          // 2. Opening begins: Wait for the 300ms CSS animation to finish
          this.openTimeout = setTimeout(() => {
            this.isContentVisible.set(true);
          }, 300); // Matches the transition duration
        }
      });
    });

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
