import { Component, inject } from '@angular/core';
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
import { ErrorCodes, ErrorService } from '../../core/error.handler';

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
})
export class Detail {
  private route = inject(ActivatedRoute);
  private bookService = inject(BookService);
  private cartStore = inject(CartStore);
  errorService = inject(ErrorService);
  readonly store = inject(AppStore);
  ux = inject(UXService);

  book = toSignal(
    this.route.params.pipe(
      switchMap((params) =>
        this.bookService.getOne(params['id'], this.store.currentType()).pipe(
          catchError(() => {
            this.errorService.handleError(ErrorCodes.FETCH_PRODUCT);
            return of(null); // Return null so the UI can show an error state
          }),
        ),
      ),
    ),
  );

  handleCartAction() {
    const currentBook = this.book();
    if (currentBook) {
      if (this.ux.isInCart(currentBook)) {
        this.cartStore.removeItem(currentBook.id);
      } else {
        this.cartStore.addToCart(currentBook);
      }
    }
  }
}
