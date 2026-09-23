import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { EditSessionService } from '../../services/edit-session.service';
import { LucidePlus } from '@lucide/angular';
import { OrderTable } from '../../components/order-table';
import {
  ErrorCodes,
  ErrorService,
  LoadingService,
  RedFocusDirective,
} from '@core';
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
  MatDialogRef,
} from '@angular/material/dialog';
import { TemplateRef } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  AppActions,
  AppStateRoot,
  CartActions,
  selectAppFilters,
  selectBooksVersion,
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
import {
  MatError,
  MatFormField,
  MatInput,
  MatLabel,
} from '@angular/material/input';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  map,
  of,
  switchMap,
} from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CreateProductDto as IProduct, CreateProductDto } from '@api';
import { BookService, ToastService } from '@service';
import { CurrencyPipe } from '@angular/common';
import { greaterThanValidator } from './validators';

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
    MatError,
  ],
  templateUrl: './administration.html',
  styleUrl: './administration.css',
})
export class Administration implements OnInit {
  loading = inject(LoadingService);
  toast = inject(ToastService);
  private readonly editSession = inject(EditSessionService);
  searchControl = new FormControl('', { nonNullable: true });
  searchProduct = signal<CreateProductDto | null>(null);

  readonly editForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(3)]),
    price: new FormControl(0, [greaterThanValidator(5, 'greaterThanPrice')]),
    availableCount: new FormControl(0, [
      greaterThanValidator(0, 'greaterThanZero'),
    ]),
  });

  private bookService = inject(BookService);
  private errorService = inject(ErrorService);
  private dialog = inject(MatDialog);
  private editDialogRef?: MatDialogRef<unknown>;
  private readonly appStore = inject(Store<AppStateRoot & UserStateRoot>);
  readonly productType = this.appStore.selectSignal(selectProductType);
  readonly booksVersion = this.appStore.selectSignal(selectBooksVersion);
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
      .subscribe((product) => {
        this.searchProduct.set(product);
        this.editSession.setCurrent(product);
      });

    // re-fetch single updated product
    effect(() => {
      void this.booksVersion();
      const pinned = this.editSession.current;
      if (!pinned) return;
      this.bookService
        .getOne(pinned.id, this.productType())
        .subscribe((updated) => {
          if (updated) {
            this.searchProduct.set(updated);
            this.editSession.setCurrent(updated);
          }
        });
    });
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
    const product = this.editSession.current;
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

  showEditProduct(editDialog: TemplateRef<unknown>) {
    const product = this.editSession.current;
    if (!product) return;

    this.editForm.patchValue({
      name: product.name,
      price: Number(product.price),
      availableCount: Number(product.availableCount),
    });

    this.editDialogRef = this.dialog.open(editDialog);
  }

  saveEditedProduct() {
    const product = this.editSession.current;
    if (!product) return;

    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      this.toast.alert('Invalid form');
      return;
    }

    this.appStore.dispatch(
      AppActions.saveProduct({
        id: product.id,
        data: this.editForm.getRawValue() as Partial<IProduct>,
      }),
    );
    this.editDialogRef?.close();
  }
}
