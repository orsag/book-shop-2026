import { Component, inject, signal } from '@angular/core';
import { BookFilters } from '@store/libs';
import { RouterLink } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { ConfigurationService } from '@service';
import { MatButton } from '@angular/material/button';
import { Store } from '@ngrx/store';
import {
  AppActions,
  AppStateRoot,
  UserStateRoot,
  selectIsAdmin,
  selectIsLoggedIn,
} from '@ngrx';

@Component({
  selector: 'app-filter-bar',
  imports: [TranslocoDirective, RouterLink, MatButton],
  templateUrl: './filter-bar.html',
  styleUrl: './filter-bar.css',
})
export class FilterBar {
  private readonly appStore = inject(Store<AppStateRoot & UserStateRoot>);
  readonly userStore = {
    isLoggedIn: this.appStore.selectSignal(selectIsLoggedIn),
    isAdmin: this.appStore.selectSignal(selectIsAdmin),
  };
  config = inject(ConfigurationService);
  filters = signal<BookFilters>({
    type: 'BOOK',
    search: '',
    category: null,
    isDiscounted: false,
  });

  updateFilter<K extends keyof BookFilters>(key: K, value: BookFilters[K]) {
    this.filters.update((f) => ({ ...f, [key]: value }));
    this.appStore.dispatch(
      AppActions.updateFilters({ partial: { ...this.filters() } }),
    );
  }
}