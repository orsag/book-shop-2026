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
import { form, min, required, maxLength } from '@angular/forms/signals';
import {
  Product,
  UpdateProductDto,
  EMPTY_BOOK,
  BookDetails,
  createProduct,
} from '@store/libs';
import { CATEGORIES } from '@store/shared-models';
import { AppStore } from '../../store/app-store';
import { TranslocoDirective } from '@jsverse/transloco';
import { FormFieldComponent } from '../../components/form-field/form-field';
import { applyCommonProductRules } from './form-rules.shared';

type UpdateProductDtoFrontend = Omit<UpdateProductDto, 'bookDetails'> & {
  bookDetails: NonNullable<UpdateProductDto['bookDetails']>;
};

@Component({
  selector: 'app-edit-book-modal',
  imports: [CommonModule, TranslocoDirective, FormFieldComponent],
  template: `
    <dialog *transloco="let t" class="modal modal-open">
      <div class="modal-box max-w-2xl">
        <h3 class="font-bold text-xl mb-4 text-primary">
          {{ selectedBook() ? t('edit_modal.edit') : t('edit_modal.create') }}
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <!-- FULL WIDTH: Title -->
          <app-form-field
            [class.md:col-span-2]="true"
            [control]="editForm.name"
            [inputId]="'title-' + idBook"
            [label]="t('edit_modal.name_min')"
          />

          <!-- alternativeHeadline -->
          <app-form-field
            [control]="editForm.alternativeHeadline"
            [inputId]="'headline-' + idBook"
            [label]="t('edit_modal.alternativeHeadline')"
          />

          <!-- Author -->
          <app-form-field
            [control]="editForm.bookDetails.author"
            [inputId]="'author-' + idBook"
            [label]="t('edit_modal.author')"
          />

          <!-- ISBN -->
          <app-form-field
            [control]="editForm.bookDetails.isbn"
            [inputId]="'isbn-' + idBook"
            label="ISBN"
          />

          <!-- Price -->
          <app-form-field
            type="number"
            [control]="editForm.price"
            [inputId]="'price-' + idBook"
            [label]="t('edit_modal.price')"
          />

          <!-- Available count -->
          <app-form-field
            type="number"
            [control]="editForm.availableCount"
            [inputId]="'available-' + idBook"
            [label]="t('edit_modal.availableCount')"
          />

          <!-- Category -->
          <app-form-field
            type="select"
            [control]="editForm.bookDetails.category"
            [inputId]="'category-' + idBook"
            [label]="t('edit_modal.category')"
            [items]="bookCategories"
            [placeholder]="t('edit_modal.pick_category')"
          />

          <!-- Discount -->
          <app-form-field
            type="number"
            step="0.1"
            [control]="editForm.discount"
            [inputId]="'discount-' + idBook"
            [label]="t('edit_modal.discount')"
          />

          <!-- PageCount -->
          <app-form-field
            type="number"
            [control]="editForm.bookDetails.pageCount"
            [inputId]="'pageCount-' + idBook"
            [label]="t('edit_modal.pageCount')"
          />

          <!-- Publisher -->
          <app-form-field
            [control]="editForm.bookDetails.publisher"
            [inputId]="'publisher-' + idBook"
            [label]="t('edit_modal.publisher')"
          />

          <!-- publishedDate -->
          <app-form-field
            type="date"
            [control]="editForm.bookDetails.publishedDate"
            [inputId]="'publishedDate-' + idBook"
            [label]="t('edit_modal.publishedDate')"
          />

          <!-- audioBook -->
          <app-form-field
            type="checkbox"
            [control]="editForm.bookDetails.audioBook"
            [inputId]="'audioBook-' + idBook"
            [label]="t('edit_modal.audioBook')"
          />

          <!-- audioBook -->
          <app-form-field
            type="number"
            step="5"
            [control]="editForm.bookDetails.audioLength"
            [inputId]="'audioLength-' + idBook"
            [label]="t('edit_modal.audioLength')"
          />

          <!-- FULL WIDTH: Description -->
          <app-form-field
            type="textarea"
            [class.md:col-span-2]="true"
            [control]="editForm.description"
            [inputId]="'description-' + idBook"
            [label]="t('edit_modal.description')"
          />
        </div>

        <div class="modal-action">
          <button class="btn btn-primary" (click)="handleAddProduct()">
            Add product
          </button>
          <button class="btn btn-ghost" (click)="handleClose()">
            {{ t('edit_modal.cancel') }}
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
export class EditBookModalComponent {
  closeModal = output<void>();
  commonSave = output<{ id: string | undefined; dataToSave: any }>();
  readonly selectedBook = input.required<Product | null>();
  store = inject(AppStore);

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
    // Common rules
    applyCommonProductRules(schemaPath);

    required(schemaPath.bookDetails.author, {
      message: 'Author is required',
    });
    maxLength(schemaPath.bookDetails.isbn, 20, {
      message: 'ISBN must be max 20 chars',
    });
    min(schemaPath.bookDetails.pageCount, 1, {
      message: 'Page count must be min 1 pages',
    });
  });

  handleSave() {
    if (this.editForm().invalid()) return;
    this.commonSave.emit({
      id: this.idBook(),
      dataToSave: this.editForm().value(),
    });
  }

  handleAddProduct() {
    const currentType = this.store.currentType();
    const createInput = createProduct(currentType);
    this.store.setTemporaryProduct(createInput);
  }

  handleClose() {
    this.closeModal.emit();
  }
}
