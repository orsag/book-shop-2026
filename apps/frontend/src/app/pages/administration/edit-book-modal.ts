import {
  Component,
  signal,
  output,
  inject,
  input,
  computed,
  effect,
  untracked,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  form,
  min,
  required,
  maxLength,
  minLength,
  FormField,
} from '@angular/forms/signals';
import {
  Product,
  UpdateProductDto,
  EMPTY_BOOK,
  BookDetails,
} from '@store/libs';
import { CATEGORIES } from '@store/shared-models';
import { BookService } from '../../services/book-service';
import {
  ErrorCodes,
  ErrorHandlerService,
  SuccessCodes,
} from '../../core/error.handler';
import { AppStore } from '../../store/app-store';
import { TranslocoDirective } from '@jsverse/transloco';
import { NoFocusJumpDirective } from '../../core/no-focus-jump.directive';
const BOOK_STORAGE_KEY = 'bookSaved';

type UpdateProductDtoFrontend = Omit<UpdateProductDto, 'bookDetails'> & {
  bookDetails: NonNullable<UpdateProductDto['bookDetails']>;
};

@Component({
  selector: 'app-edit-modal',
  imports: [CommonModule, FormField, TranslocoDirective, NoFocusJumpDirective],
  template: `
    <dialog *transloco="let t" class="modal modal-open">
      <div class="modal-box max-w-2xl">
        <h3 class="font-bold text-xl mb-4 text-primary">
          {{ selectedBook() ? t('edit_modal.edit') : t('edit_modal.create') }}
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <!-- FULL WIDTH: Title -->
          <div class="form-control md:col-span-2">
            <label class="label" [attr.for]="'title-' + selectedBook()?.id">
              <span class="label-text font-semibold">{{
                t('edit_modal.name')
              }}</span>
            </label>
            <input
              appNoFocusJump
              type="text"
              [id]="'title-' + idBook"
              [formField]="editForm.name"
              class="input input-bordered w-full"
              [class.input-error]="
                editForm.name().touched() && editForm.name().invalid()
              "
            />
            @if (editForm.name().touched() && editForm.name().invalid()) {
              <span class="text-error text-xs mt-1">{{
                t('edit_modal.name_min')
              }}</span>
            }
          </div>

          <!-- alternativeHeadline -->
          <div class="form-control">
            <label class="label" [attr.for]="'alternativeHeadline-' + idBook">
              <span class="label-text font-semibold">{{
                t('edit_modal.alternativeHeadline')
              }}</span>
            </label>
            <input
              appNoFocusJump
              type="text"
              [id]="'alternativeHeadline-' + idBook"
              [formField]="editForm.alternativeHeadline"
              class="input input-bordered w-full"
            />
          </div>

          <!-- Author -->
          <div class="form-control">
            <label class="label" [attr.for]="'author-' + idBook">
              <span class="label-text font-semibold">{{
                t('edit_modal.author')
              }}</span>
            </label>
            <input
              appNoFocusJump
              type="text"
              [id]="'author-' + idBook"
              [formField]="editForm.bookDetails.author"
              class="input input-bordered w-full"
            />
          </div>

          <!-- ISBN -->
          <div class="form-control">
            <label class="label" [attr.for]="'isbn-' + idBook">
              <span class="label-text font-semibold">ISBN</span>
            </label>
            <input
              appNoFocusJump
              type="text"
              [id]="'isbn-' + idBook"
              [formField]="editForm.bookDetails.isbn"
              class="input input-bordered w-full"
              [class.input-error]="editForm.bookDetails.isbn().invalid()"
            />
          </div>

          <!-- Price -->
          <div class="form-control">
            <label class="label" [attr.for]="'price-' + idBook">
              <span class="label-text font-semibold">{{
                t('edit_modal.price')
              }}</span>
            </label>
            <input
              appNoFocusJump
              type="number"
              [id]="'price-' + idBook"
              [formField]="editForm.price"
              class="input input-bordered w-full"
            />
          </div>

          <!-- Available count -->
          <div class="form-control">
            <label class="label" [attr.for]="'available-' + idBook">
              <span class="label-text font-semibold">
                {{ t('edit_modal.available') }}
              </span>
            </label>
            <input
              appNoFocusJump
              type="number"
              [id]="'available-' + idBook"
              [formField]="editForm.availableCount"
              class="input input-bordered w-full"
            />
          </div>

          <!-- Category -->
          <div class="form-control">
            <label class="label" [attr.for]="'category-' + idBook">
              <span class="label-text font-semibold">
                {{ t('edit_modal.category') }}
              </span>
            </label>
            <select
              appNoFocusJump
              [id]="'category-' + idBook"
              [formField]="editForm.bookDetails.category"
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

          <!-- Discount -->
          <div class="form-control">
            <label class="label" [attr.for]="'discount-' + idBook">
              <span class="label-text font-semibold">
                {{ t('edit_modal.discount') }}
              </span>
            </label>
            <input
              appNoFocusJump
              type="number"
              step="0.1"
              [id]="'discount-' + idBook()"
              [formField]="editForm.discount"
              class="input input-bordered w-full"
              (input)="clampDiscount($event)"
            />
          </div>

          <!-- PageCount -->
          <div class="form-control">
            <label class="label" [attr.for]="'pageCount-' + idBook">
              <span class="label-text font-semibold">
                {{ t('edit_modal.pageCount') }}
              </span>
            </label>
            <input
              appNoFocusJump
              type="number"
              [id]="'pageCount-' + idBook()"
              [formField]="editForm.bookDetails.pageCount"
              class="input input-bordered w-full"
            />
          </div>

          <!-- Publisher -->
          <div class="form-control">
            <label class="label" [attr.for]="'publisher-' + idBook">
              <span class="label-text font-semibold">
                {{ t('edit_modal.publisher') }}
              </span>
            </label>
            <input
              appNoFocusJump
              type="text"
              [id]="'publisher-' + idBook()"
              [formField]="editForm.bookDetails.publisher"
              class="input input-bordered w-full"
            />
          </div>

          <!-- publishedDate -->
          <div class="form-control">
            <label class="label" [attr.for]="'publishedDate-' + idBook">
              <span class="label-text font-semibold">
                {{ t('edit_modal.publishedDate') }}
              </span>
            </label>
            <input
              appNoFocusJump
              type="date"
              [id]="'publishedDate-' + idBook()"
              [formField]="editForm.bookDetails.publishedDate"
              class="input input-bordered w-full"
            />
          </div>

          <div class="form-control">
            <label class="label" [attr.for]="'audioBook-' + idBook">
              <span class="label-text font-semibold">
                {{ t('edit_modal.audioBook') }}
              </span>
            </label>
            <input
              appNoFocusJump
              type="checkbox"
              [id]="'audioBook-' + idBook()"
              [formField]="editForm.bookDetails.audioBook"
              class="input input-bordered w-full"
            />
          </div>

          <div class="form-control">
            <label class="label" [attr.for]="'audioLength-' + idBook">
              <span class="label-text font-semibold">
                {{ t('edit_modal.audioLength') }}
              </span>
            </label>
            <input
              appNoFocusJump
              type="number"
              [id]="'audioLength-' + idBook()"
              [formField]="editForm.bookDetails.audioLength"
              class="input input-bordered w-full"
            />
          </div>

          <!-- FULL WIDTH: Description -->
          <div class="form-control md:col-span-2">
            <label class="label" [attr.for]="'description-' + idBook">
              <span class="label-text font-semibold">
                {{ t('edit_modal.description') }}
              </span>
            </label>
            <textarea
              appNoFocusJump
              [id]="'description-' + idBook"
              [formField]="editForm.description"
              class="textarea textarea-bordered w-full h-28"
            ></textarea>
          </div>
        </div>

        <div class="modal-action">
          <button class="btn btn-ghost" (click)="handleClose()">
            {{ t('edit_modal.cancel') }}
          </button>
          <button class="btn btn-ghost" (click)="handleSaveLocalStorage()">
            {{ t('edit_modal.local_save') }}
          </button>
          <button
            class="btn btn-primary px-10"
            [disabled]="editForm().invalid()"
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
export class EditModalComponent {
  closeModal = output<void>();
  readonly selectedBook = input.required<Product | null>();
  store = inject(AppStore);
  bookService = inject(BookService);
  errorService = inject(ErrorHandlerService);

  editModel = signal<UpdateProductDtoFrontend>({
    ...(EMPTY_BOOK as UpdateProductDtoFrontend),
  });
  readonly idBook = computed(() => this.selectedBook()?.id);

  bookCategories = CATEGORIES;
  private hasOpened = false;

  constructor() {
    effect(() => {
      const book = this.selectedBook();

      // Check if value is defined and we haven't opened yet
      if (book && !this.hasOpened) {
        this.hasOpened = true;

        // Execute your logic
        untracked(() => {
          const descriptor = book.description ? book.description : '';
          const quality = book.product_quality ? book.product_quality : 'new';
          const details = book.bookDetails
            ? book.bookDetails
            : (EMPTY_BOOK.bookDetails as BookDetails);

          this.editModel.set({
            name: book.name,
            alternativeHeadline: book.alternativeHeadline,
            price: book.price,
            discount: book.discount,
            availableCount: book.availableCount,
            availability: book.availability,
            deliveryLeadTime: book.deliveryLeadTime,
            productType: book.productType,
            description: descriptor,
            product_quality: quality,
            bookDetails: { ...details },
          });
        });
      }
    });
  }

  editForm = form(this.editModel, (schemaPath) => {
    required(schemaPath.name, {
      message: 'Title is required',
    });
    required(schemaPath.bookDetails.author, {
      message: 'Author is required',
    });
    minLength(schemaPath.name, 3, {
      message: 'Title must be min 3 chars',
    });
    maxLength(schemaPath.name, 50, {
      message: 'Title must be max 50 chars',
    });
    maxLength(schemaPath.bookDetails.isbn, 20, {
      message: 'ISBN must be max 20 chars',
    });
    min(schemaPath.bookDetails.pageCount, 1, {
      message: 'Page count must be min 1 pages',
    });
    min(schemaPath.availableCount, 0, {
      message: 'Available count must be min 0',
    });
  });

  clampDiscount(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = parseFloat(input.value);

    if (value > 1) input.value = '1';
    if (value < 0) input.value = '0';
  }

  handleSaveLocalStorage() {
    const formData: Partial<Product> = this.editForm().value();
    const newBook = {
      id: this.idBook() ?? null,
      ...formData,
    };
    localStorage.setItem(BOOK_STORAGE_KEY, JSON.stringify(newBook));
    this.errorService.handleSuccess(SuccessCodes.BOOK_SAVE);
  }

  handleSave() {
    if (this.editForm().invalid()) return;

    const id = this.idBook();

    // In your Angular Dialog
    const dataToSave = this.editForm().value();

    if (id) {
      this.bookService.update(id, dataToSave).subscribe({
        next: (updatedBook) => {
          this.errorService.handleSuccess(SuccessCodes.BOOK_UPDATE);
          this.store.loadBooks();
          this.handleClose();
        },
        error: (err) => {
          this.errorService.handleError(ErrorCodes.BOOK_UPDATE);
          console.error(err);
        },
      });
    } else {
      this.bookService.create(dataToSave).subscribe({
        next: (newBook) => {
          this.errorService.handleSuccess(SuccessCodes.BOOK_CREATE);
          this.store.loadBooks();
          this.handleClose();
        },
        error: (err) => {
          this.errorService.handleError(ErrorCodes.BOOK_CREATE);
          console.error(err);
        },
      });
    }
  }

  handleClose() {
    this.closeModal.emit();
  }
}
