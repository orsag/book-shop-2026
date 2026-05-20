import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { BookCard } from '../../components/book-card/book-card';
import { BookListItem } from '../../components/book-list-item/book-list-item';
import { AppStore } from '../../store/app-store';
import { LucideFrown } from '@lucide/angular';
import { Pagination } from '../../components/pagination/pagination';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { isPlatformBrowser } from '@angular/common';
import { CartStore } from '../../store/cart-store';

@Component({
  selector: 'app-dashboard',
  imports: [BookCard, BookListItem, Pagination, LucideFrown],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private breakpointObserver = inject(BreakpointObserver);
  store = inject(AppStore);
  cart = inject(CartStore);
  platformId = inject(PLATFORM_ID);

  ngOnInit() {
    this.store.loadBooks();

    this.breakpointObserver.observe(Breakpoints.Handset).subscribe((result) => {
      if (result.matches) this.store.setViewLayout('list');
    });

    if (isPlatformBrowser(this.platformId)) {
      this.cart.syncCartWithServer();
    }
  }
}
