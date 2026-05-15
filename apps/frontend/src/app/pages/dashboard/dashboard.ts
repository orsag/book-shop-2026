import { Component, inject, OnInit } from '@angular/core';
import { BookCard } from '../../components/book-card/book-card';
import { BookListItem } from '../../components/book-list-item/book-list-item';
import { AppStore } from '../../store/app-store';
import { LucideFrown } from '@lucide/angular';
import { Pagination } from '../../components/pagination/pagination';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Component({
  selector: 'app-dashboard',
  imports: [BookCard, BookListItem, Pagination, LucideFrown],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private breakpointObserver = inject(BreakpointObserver);
  store = inject(AppStore);

  ngOnInit() {
    this.breakpointObserver.observe(Breakpoints.Handset).subscribe((result) => {
      if (result.matches) this.store.setViewLayout('list');
    });
  }
}
