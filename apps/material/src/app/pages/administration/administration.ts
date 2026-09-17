import { Component, inject, OnInit, signal } from '@angular/core';
import { LucideFaceSlightlyFrowning, LucidePlus } from '@lucide/angular';
import { OrderTable } from '../../components/order-table';
import { ErrorCodes, ErrorService, LoadingService, RedFocusDirective } from '@core';
import { RouterLink } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatButtonToggleGroup } from '@angular/material/button-toggle';
import { MatTableModule } from '@angular/material/table';
import {
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle,
} from '@angular/material/dialog';
import { TemplateRef } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  AppActions,
  AppStateRoot,
  CartActions,
  selectAppFilters,
  selectHasMorePage,
  selectIsAdmin,
  selectIsEmpty,
  selectProductType,
  selectProductsResponse,
  selectTotalPages,
  selectTotalProducts,
  selectUser,
  UserStateRoot,
} from '@ngrx';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { catchError, debounceTime, distinctUntilChanged, map, of, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CreateProductDto } from '@api';
import { BookService } from '@service';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-administration',
  imports: [
    CurrencyPipe,
    RouterLink,
    LucidePlus,
    OrderTable,
    RedFocusDirective,
    TranslocoDirective,
    MatButton,
    MatCard,
    MatCardContent,
    MatButtonToggleGroup,
    MatTableModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatFormField,
    MatLabel,
    MatInput,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './administration.html',
  styleUrl: './administration.css',
})
export class Administration implements OnInit {
  loading = inject(LoadingService);
  searchControl = new FormControl('', { nonNullable: true });
  searchProduct = signal<CreateProductDto | null>(null);
  private bookService = inject(BookService);
  private errorService = inject(ErrorService);
  private dialog = inject(MatDialog);
  private readonly appStore = inject(Store<AppStateRoot & UserStateRoot>);
  readonly productType = this.appStore.selectSignal(selectProductType);
  searchResults = this.appStore.selectSignal(selectProductsResponse);
  searchMode = signal<'id' | 'name' | null>(null);

  readonly user = this.appStore.selectSignal(selectUser);
  readonly isAdmin = this.appStore.selectSignal(selectIsAdmin);

  readonly store = {
    isEmpty: this.appStore.selectSignal(selectIsEmpty),
    filters: this.appStore.selectSignal(selectAppFilters),
    hasMorePage: this.appStore.selectSignal(selectHasMorePage),
    totalPages: this.appStore.selectSignal(selectTotalPages),
    totalProducts: this.appStore.selectSignal(selectTotalProducts),
    setPage: (page: number) =>
      this.appStore.dispatch(AppActions.setPage({ page })),
  };

  ngOnInit() {
    if (this.isAdmin()) {
      const userId = this.user()?.id;
      if (userId) {
        this.appStore.dispatch(CartActions.reloadOrders({ userId }));
      }
    }
  }

  constructor() {
    this.searchControl.valueChanges
      .pipe(
        map((search) => search.trim()),
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((search) => this.search(search)),
        takeUntilDestroyed(),
      )
      .subscribe((product) => this.searchProduct.set(product));
  }

  private search(search: string) {
    this.searchProduct.set(null);
    if (this.isUuidLike(search)) {
      this.searchMode.set('id');
      return this.bookService.getOne(search, this.productType()).pipe(
        catchError(() => {
          this.errorService.handleError(ErrorCodes.FETCH_PRODUCT);
          return of(null);
        }),
      );
    }
    this.searchMode.set('name');
    this.appStore.dispatch(AppActions.updateFilters({ partial: { search } }));
    return of(null);
  }

  private isUuidLike(value: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      value,
    );
  }

  copyProductId(id: string) {
    this.searchControl.setValue(id);
  }

  clearSearch() {
    this.searchControl.setValue('');
    this.searchMode.set('name');
  }

  goBack() {
    this.searchMode.set('name');
    this.searchProduct.set(null);
    const previousName = this.store.filters().search;
    if (previousName) {
      this.searchControl.setValue(previousName, { emitEvent: false });
    }
  }

  deleteProduct(confirmDialog: TemplateRef<unknown>) {
    const product = this.searchProduct();
    if (!product) return;

    this.dialog
      .open(confirmDialog)
      .afterClosed()
      .subscribe((result: boolean | undefined) => {
        if (result) {
          this.appStore.dispatch(
            AppActions.deleteProduct({ bookId: product.id }),
          );
        }
      });
  }

  openCreateModal() {
    // do nothing
  }
}
