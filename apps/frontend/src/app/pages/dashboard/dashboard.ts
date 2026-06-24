import { Component, computed, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { BookCard } from '../../components/book-card/book-card';
import { BookListItem } from '../../components/book-list-item/book-list-item';
import { AppStore } from '../../store/app-store';
import { Pagination } from '../../components/pagination/pagination';
import { isPlatformBrowser, NgTemplateOutlet } from '@angular/common';
import { CartStore } from '../../store/cart-store';
import { FilterBar } from '../../components/filter-bar/filter-bar';
import { LucideSearchX } from '@lucide/angular';
import { ConfigurationService } from '../../services/configuration-service';
import { VIEW_LAYOUTS } from '@store/libs';

@Component({
  selector: 'app-dashboard',
  imports: [
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
export class Dashboard implements OnInit {
  store = inject(AppStore);
  cart = inject(CartStore);
  platformId = inject(PLATFORM_ID);
  config = inject(ConfigurationService);

  ngOnInit() {
    this.store.loadBooks();

    if (isPlatformBrowser(this.platformId)) {
      this.cart.syncCartWithServer();
    }
  }

  isOpenedFilter = computed<boolean>(() => this.config.getFilterValue());
  protected readonly VIEW_LAYOUTS = VIEW_LAYOUTS;
}
