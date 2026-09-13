import { Component, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import {
  LucideBookOpenText,
  LucideCalendarDays,
  LucideClock,
  LucideHeadphones,
  LucideLanguages,
  LucideSearchX,
} from '@lucide/angular';
import { TranslocoDirective } from '@jsverse/transloco';
import { ErrorCodes, ErrorService, RedFocusDirective, SinglePricePipe } from '@core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BookService, ConfigurationService, UXService } from '@service';
import { CartStore } from '@store';
import { Store } from '@ngrx/store';
import { AppStateRoot, selectProductType } from '@ngrx';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of, switchMap } from 'rxjs';
import { MatButton } from '@angular/material/button';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.html',
  styleUrl: './detail.css',
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
    RedFocusDirective,
    SinglePricePipe,
    RouterLink,
    MatButton,
    MatProgressSpinner,
  ],
})
export class Detail {
  private route = inject(ActivatedRoute);
  private bookService = inject(BookService);
  private cartStore = inject(CartStore);
  private readonly appStore = inject(Store<AppStateRoot>);
  config = inject(ConfigurationService);
  errorService = inject(ErrorService);
  ux = inject(UXService);
  isHovered = signal(false);

  book = toSignal(
    this.route.params.pipe(
      switchMap((params) =>
        this.bookService.getOne(
          params['id'],
          this.appStore.selectSignal(selectProductType)(),
        ).pipe(
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
