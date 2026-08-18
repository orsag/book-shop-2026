import {
  Component,
  output,
  inject,
  input,
  computed,
  effect,
  untracked,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { EMPTY_BOOK } from '@store/libs';
import { CreateProductDto as IProduct, BookDto } from '@api';
import { CreateProductDtoProductType as ProductType } from '@api';
import { createProduct } from '../../../../../../prisma/createProduct';
import { CATEGORIES } from '@store/shared-models';
import { AppStore } from '@store';
import { TranslocoDirective } from '@jsverse/transloco';
import { CdkTrapFocus } from '@angular/cdk/a11y';
import { RedFocusDirective } from '@core';
import { ToastService } from '@service';

@Component({
  selector: 'app-edit-book-reactive',
  imports: [
    CommonModule,
    TranslocoDirective,
    ReactiveFormsModule,
    CdkTrapFocus,
    RedFocusDirective,
  ],
  template: `
    <dialog cdkTrapFocus *transloco="let t" class="modal modal-open">
      <div class="modal-box max-w-2xl">
        <h3 class="font-bold text-xl mb-4 text-primary">
          {{ selectedBook() ? t('edit_modal.edit') : t('edit_modal.create') }}
        </h3>

        <form [formGroup]="form" class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div class="form-control md:col-span-2">
            <label class="label" for="title">
              <span class="label-text font-semibold">{{
                t('edit_modal.name_min')
              }}</span>
            </label>
            <input
              id="title"
              formControlName="name"
              class="input input-bordered validator w-full"
            />
            @if (form.get('name')?.touched && form.get('name')?.invalid) {
              <div class="mt-1">
                <ul class="space-y-1">
                  @if (form.get('name')?.errors?.['required']) {
                    <li class="validator-hint">
                      <span>Title is required</span>
                    </li>
                  }
                  @if (form.get('name')?.errors?.['minlength']) {
                    <li class="validator-hint">
                      <span>Title must be min 3 chars</span>
                    </li>
                  }
                  @if (form.get('name')?.errors?.['maxlength']) {
                    <li class="validator-hint">
                      <span>Title must be max 50 chars</span>
                    </li>
                  }
                </ul>
              </div>
            }
          </div>

          <div class="form-control">
            <label class="label" for="headline">
              <span class="label-text font-semibold">{{
                t('edit_modal.alternativeHeadline')
              }}</span>
            </label>
            <input
              id="headline"
              formControlName="alternativeHeadline"
              class="input input-bordered validator w-full"
            />
          </div>

          <div formGroupName="bookDetails" class="contents">
            <div class="form-control">
              <label class="label" for="author">
                <span class="label-text font-semibold">{{
                  t('edit_modal.author')
                }}</span>
              </label>
              <input
                id="author"
                formControlName="author"
                class="input input-bordered validator w-full"
              />
              @if (
                form.get('bookDetails.author')?.touched &&
                form.get('bookDetails.author')?.invalid
              ) {
                <div class="mt-1">
                  <ul class="space-y-1">
                    @if (form.get('bookDetails.author')?.errors?.['required']) {
                      <li class="validator-hint">
                        <span>Author is required</span>
                      </li>
                    }
                  </ul>
                </div>
              }
            </div>

            <div class="form-control">
              <label class="label" for="isbn">
                <span class="label-text font-semibold">ISBN</span>
              </label>
              <input
                id="isbn"
                formControlName="isbn"
                class="input input-bordered validator w-full"
              />
              @if (
                form.get('bookDetails.isbn')?.touched &&
                form.get('bookDetails.isbn')?.invalid
              ) {
                <div class="mt-1">
                  <ul class="space-y-1">
                    @if (form.get('bookDetails.isbn')?.errors?.['maxlength']) {
                      <li class="validator-hint">
                        <span>ISBN must be max 20 chars</span>
                      </li>
                    }
                  </ul>
                </div>
              }
            </div>
          </div>

          <div class="form-control">
            <label class="label" for="price">
              <span class="label-text font-semibold">{{
                t('edit_modal.price')
              }}</span>
            </label>
            <input
              id="price"
              type="number"
              formControlName="price"
              class="input input-bordered validator w-full"
            />
          </div>

          <div class="form-control">
            <label class="label" for="available">
              <span class="label-text font-semibold">{{
                t('edit_modal.availableCount')
              }}</span>
            </label>
            <input
              id="available"
              type="number"
              formControlName="availableCount"
              class="input input-bordered validator w-full"
            />
          </div>

          <div formGroupName="bookDetails" class="contents">
            <div class="form-control">
              <label class="label" for="category">
                <span class="label-text font-semibold">{{
                  t('edit_modal.category')
                }}</span>
              </label>
              <select
                id="category"
                formControlName="category"
                class="select select-bordered w-full"
              >
                <option value="" disabled selected>
                  {{ t('edit_modal.pick_category') }}
                </option>
                @for (cat of bookCategories; track cat) {
                  <option [value]="cat">{{ cat }}</option>
                }
              </select>
            </div>
          </div>

          <div class="form-control">
            <label class="label" for="discount">
              <span class="label-text font-semibold">{{
                t('edit_modal.discount')
              }}</span>
            </label>
            <input
              id="discount"
              type="number"
              step="0.1"
              formControlName="discount"
              class="input input-bordered validator w-full"
            />
          </div>

          <div formGroupName="bookDetails" class="contents">
            <div class="form-control">
              <label class="label" for="pageCount">
                <span class="label-text font-semibold">{{
                  t('edit_modal.pageCount')
                }}</span>
              </label>
              <input
                id="pageCount"
                type="number"
                formControlName="pageCount"
                class="input input-bordered validator w-full"
              />
              @if (
                form.get('bookDetails.pageCount')?.touched &&
                form.get('bookDetails.pageCount')?.invalid
              ) {
                <div class="mt-1">
                  <ul class="space-y-1">
                    @if (
                      form.get('bookDetails.pageCount')?.errors?.['required']
                    ) {
                      <li class="validator-hint">
                        <span>Page count is required</span>
                      </li>
                    }
                    @if (form.get('bookDetails.pageCount')?.errors?.['min']) {
                      <li class="validator-hint">
                        <span>Page count must be min 1 pages</span>
                      </li>
                    }
                  </ul>
                </div>
              }
            </div>

            <div class="form-control">
              <label class="label" for="publisher">
                <span class="label-text font-semibold">{{
                  t('edit_modal.publisher')
                }}</span>
              </label>
              <input
                id="publisher"
                formControlName="publisher"
                class="input input-bordered validator w-full"
              />
            </div>
          </div>

          <div formGroupName="bookDetails" class="contents">
            <div class="form-control">
              <label class="label" for="publishedDate">
                <span class="label-text font-semibold">{{
                  t('edit_modal.publishedDate')
                }}</span>
              </label>
              <input
                id="publishedDate"
                type="date"
                formControlName="publishedDate"
                class="input input-bordered validator w-full"
              />
            </div>

            <div class="form-control">
              <div class="flex items-center h-12">
                <input
                  type="checkbox"
                  id="audioBook"
                  formControlName="audioBook"
                  class="checkbox checkbox-primary"
                />
                <label for="audioBook" class="ml-2">{{
                  t('edit_modal.audioBook')
                }}</label>
              </div>
            </div>
          </div>

          <div formGroupName="bookDetails" class="contents">
            <div class="form-control">
              <label class="label" for="audioLength">
                <span class="label-text font-semibold">{{
                  t('edit_modal.audioLength')
                }}</span>
              </label>
              <input
                id="audioLength"
                type="number"
                step="5"
                formControlName="audioLength"
                class="input input-bordered validator w-full"
              />
            </div>
            <div></div>
          </div>

          <div class="form-control md:col-span-2">
            <label class="label" for="description">
              <span class="label-text font-semibold">{{
                t('edit_modal.description')
              }}</span>
            </label>
            <textarea
              id="description"
              formControlName="description"
              class="textarea textarea-bordered validator w-full h-28"
            ></textarea>
          </div>
        </form>

        <div class="modal-action">
          <button appRedFocus class="btn btn-ghost" (click)="handleClose()">
            {{ t('edit_modal.cancel') }}
          </button>
          <button
            appRedFocus
            class="btn btn-info"
            (click)="handleGenerateFields()"
          >
            {{ t('edit_modal.generate') }}
          </button>
          <button
            appRedFocus
            class="btn btn-primary"
            [disabled]="form.invalid"
            (click)="handleSave()"
          >
            {{
              selectedBook()
                ? t('edit_modal.btn_edit')
                : t('edit_modal.btn_create')
            }}
          </button>
        </div>
      </div>
      <div
        class="modal-backdrop"
        role="button"
        tabindex="0"
        [attr.aria-label]="t('edit_modal.close')"
        (click)="handleClose()"
        (keydown.enter)="handleClose()"
        (keydown.space)="handleClose()"
      ></div>
    </dialog>
  `,
  styles: [],
})
export class EditBookReactiveComponent {
  closeModal = output<void>();
  commonSave = output<{
    id: string | undefined;
    dataToSave: Partial<IProduct>;
  }>();
  readonly selectedBook = input.required<IProduct | null>();
  store = inject(AppStore);
  toast = inject(ToastService);

  readonly idBook = computed(() => this.selectedBook()?.id);
  bookCategories = CATEGORIES;
  private hasOpened = false;

  form = new FormGroup({
    name: new FormControl('', {
      validators: [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50),
      ],
    }),
    alternativeHeadline: new FormControl(''),
    price: new FormControl(0),
    discount: new FormControl(0, {
      validators: [Validators.min(0), Validators.max(1)],
    }),
    availableCount: new FormControl(0, {
      validators: [Validators.min(0)],
    }),
    productType: new FormControl<ProductType>('BOOK'),
    product_quality: new FormControl('new'),
    description: new FormControl(''),
    bookDetails: new FormGroup({
      id: new FormControl(''),
      productId: new FormControl(''),
      bookFormat: new FormControl(''),
      binding: new FormControl(''),
      author: new FormControl('', { validators: [Validators.required] }),
      isbn: new FormControl('', {
        validators: [Validators.maxLength(20)],
      }),
      pageCount: new FormControl(0, {
        validators: [Validators.required, Validators.min(1)],
      }),
      publisher: new FormControl(''),
      category: new FormControl(''),
      publishedDate: new FormControl(''),
      audioBook: new FormControl(false),
      audioLength: new FormControl(0),
    }),
  });

  constructor() {
    effect(() => {
      const book = this.selectedBook();

      if (book && !this.hasOpened) {
        this.hasOpened = true;

        untracked(() => {
          const details =
            book.bookDetails ?? (EMPTY_BOOK.bookDetails as BookDto);

          this.form.patchValue({
            name: book.name,
            alternativeHeadline: book.alternativeHeadline,
            price: book.price,
            discount: book.discount,
            availableCount: book.availableCount,
            productType: book.productType,
            description: book.description ?? '',
            product_quality: book.product_quality ?? 'new',
            bookDetails: {
              id: details.id,
              productId: details.productId,
              author: details.author,
              isbn: details.isbn,
              pageCount: details.pageCount,
              publisher: details.publisher,
              category: details.category,
              publishedDate: details.publishedDate,
              audioBook: details.audioBook,
              audioLength: details.audioLength,
            },
          });
        });
      }
    });
  }

  handleSave() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.alert('Invalid form');
      return;
    }

    const val = this.form.getRawValue() as unknown as IProduct;

    this.commonSave.emit({
      id: this.idBook(),
      dataToSave: val,
    });
  }

  handleGenerateFields() {
    const currentType = this.store.currentType();
    const tempProduct = createProduct(currentType);
    const FAKE_ID = crypto.randomUUID();
    const details = tempProduct.bookDetails
      ? { ...tempProduct.bookDetails.create }
      : (EMPTY_BOOK.bookDetails as BookDto);

    this.form.patchValue({
      name: tempProduct.name,
      alternativeHeadline: tempProduct.alternativeHeadline,
      price: tempProduct.price ?? 100,
      discount: tempProduct.discount ?? 0,
      availableCount: tempProduct.availableCount ?? 0,
      productType: tempProduct.productType as ProductType,
      description: tempProduct.description ?? '',
      product_quality: tempProduct.product_quality ?? 'new',
      bookDetails: {
        id: FAKE_ID,
        productId: FAKE_ID,
        author: details.author,
        isbn: details.isbn,
        pageCount: details.pageCount,
        publisher: details.publisher,
        category: details.category,
        publishedDate: details.publishedDate,
        audioBook: details.audioBook,
        audioLength: details.audioLength,
        bookFormat: details.bookFormat,
        binding: details.binding,
      },
    });
  }

  handleClose() {
    this.closeModal.emit();
  }
}
