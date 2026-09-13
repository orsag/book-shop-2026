import { Component, inject, input } from '@angular/core';
import {
  LucideChevronLeft,
  LucideChevronsLeft,
  LucideChevronRight,
  LucideChevronsRight,
} from '@lucide/angular';
import { LoadingService } from '@core';
import { ConfigurationService } from '@service';
import { MatIconButton } from '@angular/material/button';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { Store } from '@ngrx/store';
import {
  AppActions,
  AppStateRoot,
  selectAppFilters,
  selectHasMorePage,
  selectTotalPages,
  selectTotalProducts,
} from '@ngrx';

@Component({
  selector: 'app-pagination',
  imports: [
    LucideChevronLeft,
    LucideChevronsLeft,
    LucideChevronRight,
    LucideChevronsRight,
    MatIconButton,
    MatProgressSpinner,
  ],
  templateUrl: './pagination.html',
  styleUrl: './pagination.css',
})
export class Pagination {
  loading = inject(LoadingService);
  config = inject(ConfigurationService);
  private readonly appStore = inject(Store<AppStateRoot>);

  readonly store = {
    filters: this.appStore.selectSignal(selectAppFilters),
    hasMorePage: this.appStore.selectSignal(selectHasMorePage),
    totalPages: this.appStore.selectSignal(selectTotalPages),
    totalProducts: this.appStore.selectSignal(selectTotalProducts),
    setPage: (page: number) =>
      this.appStore.dispatch(AppActions.setPage({ page })),
  };

  loadedCount = input(0);
}