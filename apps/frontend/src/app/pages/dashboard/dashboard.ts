import {
  AfterViewInit,
  Component,
  computed,
  effect,
  inject,
  OnInit,
  PLATFORM_ID,
  QueryList,
  signal,
  ViewChildren,
} from '@angular/core';
import { isPlatformBrowser, NgClass, NgTemplateOutlet } from '@angular/common';
import { BookCard, BookListItem, Pagination, FilterBar } from '@component';
import { ConfigurationService, PaginationAccumulatorService } from '@service';
import { AppStore, CartStore } from '@store';
import { LucideSearchX } from '@lucide/angular';
import { VIEW_LAYOUTS } from '@store/libs';

@Component({
  selector: 'app-dashboard',
  imports: [
    NgClass,
    BookCard,
    BookListItem,
    Pagination,
    FilterBar,
    LucideSearchX,
    NgTemplateOutlet,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit, AfterViewInit {
  // Grabs ALL elements marked with #listItem as a QueryList
  @ViewChildren('listItem') listElements!: QueryList<BookListItem>;
  store = inject(AppStore);
  cart = inject(CartStore);
  platformId = inject(PLATFORM_ID);
  config = inject(ConfigurationService);
  private accumulator = inject(PaginationAccumulatorService);

  // 🚀 Single line declaration for accumulated products!
  accumulatedProducts = this.accumulator.accumulate(
    this.store.productsResource,
    computed(() => this.store.filters().page),
    computed(() => this.store.appendMode()),
    (res) => res?.data ?? [],
  );

  isOpenedFilter = computed<boolean>(() => this.config.getFilterValue());
  protected readonly VIEW_LAYOUTS = VIEW_LAYOUTS;

  animatedGridExpanded = signal(false);
  isTransitioning = signal(false);
  private debounceTimeout: any;

  constructor() {
    effect(() => {
      const filterOpened = this.isOpenedFilter();

      if (this.debounceTimeout) {
        clearTimeout(this.debounceTimeout);
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

  ngAfterViewInit() {
    // You can subscribe to changes if the array is dynamic
    this.listElements.changes.subscribe((elements) => {
      console.log('List updated, new count:', elements.length);
    });
  }
}
