import {
  Component,
  computed,
  inject,
  OnInit,
  PLATFORM_ID,
  Signal,
} from '@angular/core';
import { isPlatformBrowser, AsyncPipe } from '@angular/common';
import { ProductItem } from '../../components/product-item/product-item';
import { Pagination } from '../../components/pagination/pagination';
import { FilterBar } from '../../components/filter-bar/filter-bar';
import {
  ConfigurationService,
  PaginationAccumulatorService,
  AccumulatorRequest,
} from '@service';
import { CartStore } from '@store';
import { Store } from '@ngrx/store';
import {
  AppActions,
  AppStateRoot,
  selectAppendMode,
  selectAppFilters,
  selectHasMorePage,
  selectProductsLoading,
  selectProductsResponse,
} from '@ngrx';
import { LucideChevronDown, LucideSearchX } from '@lucide/angular';
import { LoadingService } from '@core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { MatButton } from '@angular/material/button';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-dashboard',
  imports: [
    AsyncPipe,
    ProductItem,
    Pagination,
    FilterBar,
    LucideSearchX,
    LucideChevronDown,
    MatButton,
    MatProgressSpinner,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  cart = inject(CartStore);
  loading = inject(LoadingService);
  platformId = inject(PLATFORM_ID);
  config = inject(ConfigurationService);

  private readonly appStore = inject(Store<AppStateRoot>);
  private readonly accumulator = inject(PaginationAccumulatorService);

  // Facade keeping the template API (store.hasMorePage() / store.loadMore()).
  readonly store: {
    hasMorePage: Signal<boolean>;
    loadMore: () => void;
  } = {
    hasMorePage: this.appStore.selectSignal(selectHasMorePage),
    loadMore: () => this.appStore.dispatch(AppActions.loadMore()),
  };

  readonly request = computed<AccumulatorRequest>(() => {
    const filters = this.appStore.selectSignal(selectAppFilters)();
    return {
      page: filters.page,
      append: this.appStore.selectSignal(selectAppendMode)(),
    };
  });

  // Accumulates the NgRx products pipeline (Observable source) page by page.
  accumulatedProducts$ = this.accumulator.accumulateFrom(
    this.appStore.select(selectProductsResponse),
    this.request,
    this.appStore.select(selectProductsLoading),
    (res) => res?.data ?? [],
  );

  readonly productsCount = toSignal(
    this.accumulatedProducts$.pipe(map((products) => products.length)),
    { initialValue: 0 },
  );

  readonly isProductsEmpty = computed(() => this.productsCount() === 0);

  isOpenedFilter = computed<boolean>(() => this.config.getFilterValue());

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.cart.syncCartWithServer();
    }
  }
}