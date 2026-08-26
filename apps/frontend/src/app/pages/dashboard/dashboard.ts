import {
  Component,
  computed,
  effect,
  inject,
  OnInit,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import {
  isPlatformBrowser,
  AsyncPipe,
  NgClass,
  NgTemplateOutlet,
} from '@angular/common';
import { ProductItem, Pagination, FilterBar } from '@component';
import { ConfigurationService, PaginationAccumulatorService } from '@service';
import { AppStore, CartStore } from '@store';
import { LucideChevronDown, LucideSearchX } from '@lucide/angular';
import { VIEW_LAYOUTS } from '@store/libs';
import { RedFocusDirective } from '@core';
import { LoadingService } from '../../core/loading.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  imports: [
    NgClass,
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
  platformId = inject(PLATFORM_ID);
  config = inject(ConfigurationService);
  private accumulator = inject(PaginationAccumulatorService);

  // 🚀 Single line declaration for accumulated products!
  accumulatedProducts$ = this.accumulator.accumulate(
    this.store.productsResource,
    computed(() => this.store.filters().page),
    computed(() => this.store.appendMode()),
    (res) => res?.data ?? [],
  );

  readonly productsCount = toSignal(
    this.accumulatedProducts$.pipe(map((products) => products.length)),
    { initialValue: 0 },
  );

  readonly isProductsEmpty = computed(() => this.productsCount() === 0);

  isOpenedFilter = computed<boolean>(() => this.config.getFilterValue());
  protected readonly VIEW_LAYOUTS = VIEW_LAYOUTS;

  animatedGridExpanded = signal(false);
  isTransitioning = signal(false);
  private debounceTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    effect(() => {
      const filterOpened = this.isOpenedFilter();

      if (this.debounceTimeout) {
        clearTimeout(this.debounceTimeout);
        this.debounceTimeout = null;
      }

      if (filterOpened) {
        // 1. Staggered Opening: Fade out slightly before the 250ms column swap
        setTimeout(() => this.isTransitioning.set(true), 150);

        this.debounceTimeout = setTimeout(() => {
          this.animatedGridExpanded.set(false);
          // Fade back in immediately after the layout switches
          this.isTransitioning.set(false);
        }, 450);
      } else {
        // 2. Staggered Closing: Fade out slightly before the 500ms column swap
        setTimeout(() => this.isTransitioning.set(true), 250);

        this.debounceTimeout = setTimeout(() => {
          this.animatedGridExpanded.set(true);
          // Fade back in immediately after the layout switches
          this.isTransitioning.set(false);
        }, 500);
      }
    });
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.cart.syncCartWithServer();
    }
  }
}
