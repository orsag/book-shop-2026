import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { BookCard } from '../../components/book-card/book-card';
import { BookListItem } from '../../components/book-list-item/book-list-item';
import { AppStore } from '../../store/app-store';
import { Pagination } from '../../components/pagination/pagination';
import { isPlatformBrowser } from '@angular/common';
import { CartStore } from '../../store/cart-store';
import { FilterBar } from '../../components/filter-bar/filter-bar';
import { LucideSearchX } from '@lucide/angular';

@Component({
  selector: 'app-dashboard',
  imports: [
    BookCard,
    BookListItem,
    Pagination,
    FilterBar,
    LucideSearchX,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  store = inject(AppStore);
  cart = inject(CartStore);
  platformId = inject(PLATFORM_ID);

  ngOnInit() {
    this.store.loadBooks();

    if (isPlatformBrowser(this.platformId)) {
      this.cart.syncCartWithServer();
    }
  }
}
