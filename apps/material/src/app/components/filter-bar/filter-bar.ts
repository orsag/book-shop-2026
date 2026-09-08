import { Component, inject, signal } from '@angular/core';
import { AppStore, UserStore } from '@store';
import { BookFilters } from '@store/libs';
import { RouterLink } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { ConfigurationService } from '@service';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-filter-bar',
  imports: [TranslocoDirective, RouterLink, MatButton],
  templateUrl: './filter-bar.html',
  styleUrl: './filter-bar.css',
})
export class FilterBar {
  store = inject(AppStore);
  userStore = inject(UserStore);
  config = inject(ConfigurationService);
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