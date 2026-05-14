import { Component, inject, OnInit } from '@angular/core';
import { BookCard } from '../../components/book-card/book-card';
import { BookListItem } from '../../components/book-list-item/book-list-item';
import { AppStore } from '../../store/app-store';
import { LucideFrown } from '@lucide/angular';
import { Pagination } from '../../components/pagination/pagination';

@Component({
  selector: 'app-dashboard',
  imports: [BookCard, BookListItem, Pagination, LucideFrown],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  store = inject(AppStore);

  ngOnInit() {
    if (window.innerWidth < 768) {
      this.store.setViewLayout('list');
    }
  }
}
