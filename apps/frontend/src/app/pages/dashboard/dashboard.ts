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
import { BookCard } from '../../components/book-card/book-card';
import { BookListItem } from '../../components/book-list-item/book-list-item';
import { AppStore } from '../../store/app-store';
import { Pagination } from '../../components/pagination/pagination';
import { isPlatformBrowser, NgClass, NgTemplateOutlet } from '@angular/common';
import { CartStore } from '../../store/cart-store';
import { FilterBar } from '../../components/filter-bar/filter-bar';
import { LucideSearchX } from '@lucide/angular';
import { ConfigurationService } from '../../services/configuration-service';
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
    this.store.loadBooks();

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
