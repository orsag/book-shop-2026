import { Component, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { switchMap, catchError, of } from 'rxjs';
import { BookService } from '@service';
import { AppStore, CartStore } from '@store';
import {
  LucideClock,
  LucideLanguages,
  LucideHeadphones,
  LucideBookOpenText,
  LucideCalendarDays,
  LucideSearchX,
} from '@lucide/angular';
import { TranslocoDirective } from '@jsverse/transloco';
import { UXService } from '@service';
import { ErrorCodes, ErrorService } from '@core';
import { OverlayComponent } from '@component';

@Component({
  selector: 'app-detail',
  imports: [
    CommonModule,
    CurrencyPipe,
    DatePipe,
    LucideBookOpenText,
    LucideCalendarDays,
    TranslocoDirective,
    LucideSearchX,
    LucideHeadphones,
    LucideClock,
    LucideLanguages,
    OverlayComponent,
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
  isHovered = signal(false);

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
