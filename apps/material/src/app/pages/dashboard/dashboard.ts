import {
  Component,
  computed,
  inject,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser, AsyncPipe } from '@angular/common';
import { ProductItem } from '../../components/product-item/product-item';
import { Pagination } from '../../components/pagination/pagination';
import { FilterBar } from '../../components/filter-bar/filter-bar';
import {
  ConfigurationService,
  PaginationAccumulatorService,
} from '@service';
import { AppStore, CartStore } from '@store';
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
  store = inject(AppStore);
  cart = inject(CartStore);
  loading = inject(LoadingService);
  platformId = inject(PLATFORM_ID);
  config = inject(ConfigurationService);
  private accumulator = inject(PaginationAccumulatorService);

  // 🚀 Single line declaration for accumulated products!
  accumulatedProducts$ = this.accumulator.accumulate(
    this.store.productsResource,
    computed(() => ({
      page: this.store.filters().page,
      append: this.store.appendMode(),
    })),
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