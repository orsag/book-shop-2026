import { Component, inject, signal } from '@angular/core';
import { AppStore, UserStore } from '@store';
import { BookFilters } from '@store/libs';
import { RouterLink } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { RedFocusDirective } from '@core';

@Component({
  selector: 'app-filter-bar',
  imports: [TranslocoDirective, RouterLink, RedFocusDirective],
  templateUrl: './filter-bar.html',
  styleUrl: './filter-bar.css',
})
export class FilterBar {
  store = inject(AppStore);
  userStore = inject(UserStore);
  filters = signal<BookFilters>({
    type: 'BOOK',
    search: '',
    category: null,
    isDiscounted: false,
  });

  updateFilter<K extends keyof BookFilters>(key: K, value: BookFilters[K]) {
    this.filters.update((f) => ({ ...f, [key]: value }));
    this.store.updateFilters(this.filters());
  }
}
