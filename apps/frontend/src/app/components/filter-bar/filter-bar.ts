import {
  Component,
  inject,
  signal,
} from '@angular/core';
import { AppState, AppStore } from '../../store/app-store';
import { BookFilters, QuickFilterState } from '../../../types';
import { RouterLink } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';

@Component({
  selector: 'app-filter-bar',
  imports: [TranslocoDirective],
  templateUrl: './filter-bar.html',
  styleUrl: './filter-bar.css',
})
export class FilterBar {
  store = inject(AppStore);
  filters = signal<BookFilters>({
    type: 'BOOK',
    search: '',
    category: null,
    // isAvailable: false,
    // isBestSeller: false,
    // isNewRelease: false,
    isDiscounted: false,
  });

  // 1. The Single Source of Truth
  protected filterState = signal<QuickFilterState>({
    mode: 'all',
    sortBy: null,
  });

  updateFilter<K extends keyof BookFilters>(key: K, value: BookFilters[K]) {
    this.filters.update((f) => ({ ...f, [key]: value }));
    this.store.updateFilters(this.filters());
  }
}
