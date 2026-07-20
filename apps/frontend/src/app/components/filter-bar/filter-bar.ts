import { Component, inject, signal } from '@angular/core';
import { AppStore } from '../../store/app-store';
import { BookFilters } from '../../../types';
import { RouterLink } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { UserStore } from '../../store/user-store';

@Component({
  selector: 'app-filter-bar',
  imports: [TranslocoDirective, RouterLink],
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
    // isAvailable: false,
    // isBestSeller: false,
    // isNewRelease: false,
    isDiscounted: false,
  });

  updateFilter<K extends keyof BookFilters>(key: K, value: BookFilters[K]) {
    this.filters.update((f) => ({ ...f, [key]: value }));
    this.store.updateFilters(this.filters());
  }
}
