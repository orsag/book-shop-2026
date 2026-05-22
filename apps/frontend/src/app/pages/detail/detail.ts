import { Component, inject, effect } from '@angular/core';
import {
  CommonModule,
  NgOptimizedImage,
  CurrencyPipe,
  DatePipe,
} from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { switchMap, catchError, of } from 'rxjs';
import { BookService } from '../../services/book-service';
import { AppStore } from '../../store/app-store';
import {
  LucideClock,
  LucideLanguages,
  LucideHeadphones,
  LucideBookOpenText,
  LucideCalendarDays,
  LucideSearchX,
} from '@lucide/angular';
import { CartStore } from '../../store/cart-store';
import { TranslocoDirective } from '@jsverse/transloco';
import { UXService } from '../../services/ux-service';

@Component({
  selector: 'app-detail',
  imports: [
    CommonModule,
    NgOptimizedImage,
    CurrencyPipe,
    DatePipe,
    LucideBookOpenText,
    LucideCalendarDays,
    TranslocoDirective,
    LucideSearchX,
    LucideHeadphones,
    LucideClock,
    LucideLanguages,
  ],
  templateUrl: './detail.html',
  providers: [UXService],
})
export class Detail {
  private route = inject(ActivatedRoute);
  private bookService = inject(BookService);
  private cartStore = inject(CartStore);
  readonly store = inject(AppStore);
  ux = inject(UXService);

  // 1. Reactively fetch the book based on the URL ID
  book = toSignal(
    this.route.params.pipe(
      switchMap((params) =>
        this.bookService.getOne(params['id']).pipe(
          catchError((error) => {
            console.error('Book fetch failed:', error);
            return of(null); // Return null so the UI can show an error state
          }),
        ),
      ),
    ),
  );

  // 2. Initialize your effect
  constructor() {
    effect(() => {
      const currentBook = this.book();

      // Check if the book data is loaded
      if (currentBook) {
        this.ux.setProduct(currentBook);
      }
    });
  }

  handleCartAction() {
    const currentBook = this.book();
    if (currentBook) {
      if (this.ux.isInCart()) {
        this.cartStore.removeItem(currentBook.id);
      } else {
        this.cartStore.addToCart(currentBook);
      }
    }
  }
}
