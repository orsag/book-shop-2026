import { Component, computed, inject, OnInit } from '@angular/core';
import { AsyncPipe, NgTemplateOutlet } from '@angular/common';
import { ProductItem, Pagination, FilterBar } from '@component';
import { ConfigurationService, PaginationAccumulatorService } from '@service';
import { AppStore, CartStore } from '@store';
import { LucideChevronDown, LucideSearchX } from '@lucide/angular';
import { VIEW_LAYOUTS } from '@store/libs';
import { LoadingService, RedFocusDirective } from '@core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  imports: [
    AsyncPipe,
    ProductItem,
    Pagination,
    FilterBar,
    LucideSearchX,
    NgTemplateOutlet,
    LucideChevronDown,
    RedFocusDirective,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  store = inject(AppStore);
  cart = inject(CartStore);
  loading = inject(LoadingService);
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
  protected readonly VIEW_LAYOUTS = VIEW_LAYOUTS;

  ngOnInit() {
    this.cart.syncCartWithServer();
  }
}
