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
import { form, min, required } from '@angular/forms/signals';
import {
  Product,
  UpdateProductDto,
  GastroDetails,
  EMPTY_GASTRO,
} from '@store/libs';
import { GASTRO_CATEGORIES } from '@store/shared-models';
import { AppStore } from '../../store/app-store';
import { TranslocoDirective } from '@jsverse/transloco';
import { FormFieldComponent } from '../../components/form-field/form-field';
import { applyCommonProductRules } from './form-rules.shared';

type UpdateProductDtoFrontend = Omit<UpdateProductDto, 'gastroDetails'> & {
  gastroDetails: NonNullable<UpdateProductDto['gastroDetails']>;
};

@Component({
  selector: 'app-edit-gastro-modal',
  imports: [CommonModule, FormFieldComponent, TranslocoDirective],
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

          <!-- Producer -->
          <app-form-field
            [control]="editForm.gastroDetails.producer"
            [inputId]="'producer-' + idBook"
            [label]="t('edit_modal.producer')"
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
            [control]="editForm.gastroDetails.category"
            [inputId]="'category-' + idBook"
            [label]="t('edit_modal.category')"
            [items]="productCategories"
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

          <app-form-field
            type="number"
            [control]="editForm.gastroDetails.edition"
            [inputId]="'edition-' + idBook"
            [label]="t('edit_modal.edition')"
          />

          <app-form-field
            [control]="editForm.gastroDetails.brand"
            [inputId]="'brand-' + idBook"
            [label]="t('edit_modal.brand')"
          />

          <app-form-field
            type="number"
            step="1"
            [control]="editForm.gastroDetails.weight"
            [inputId]="'weight-' + idBook"
            [label]="t('edit_modal.weight')"
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
export class EditGastroModalComponent {
  closeModal = output<void>();
  commonSave = output<{ id: string | undefined; dataToSave: any }>();
  readonly selectedBook = input.required<Product | null>();
  store = inject(AppStore);

  editModel = signal<UpdateProductDtoFrontend>({
    ...(EMPTY_GASTRO as UpdateProductDtoFrontend),
  });
  readonly idBook = computed(() => this.selectedBook()?.id);

  productCategories = GASTRO_CATEGORIES;
  private hasOpened = false;

  constructor() {
    effect(() => {
      const product = this.selectedBook();

      // Check if value is defined and we haven't opened yet
      if (product && !this.hasOpened) {
        this.hasOpened = true;

        // Execute your logic
        untracked(() => {
          const descriptor = product.description ? product.description : '';
          const quality = product.product_quality
            ? product.product_quality
            : 'new';
          const details = product.gastroDetails
            ? product.gastroDetails
            : (EMPTY_GASTRO.gastroDetails as GastroDetails);

          this.editModel.set({
            name: product.name,
            alternativeHeadline: product.alternativeHeadline,
            price: product.price,
            discount: product.discount,
            availableCount: product.availableCount,
            availability: product.availability,
            deliveryLeadTime: product.deliveryLeadTime,
            productType: product.productType,
            description: descriptor,
            product_quality: quality,
            gastroDetails: { ...details },
          });
        });
      }
    });
  }

  editForm = form(this.editModel, (schemaPath) => {
    // Common rules
    applyCommonProductRules(schemaPath);

    required(schemaPath.gastroDetails.producer, {
      message: 'Producer is required',
    });
    min(schemaPath.gastroDetails.weight, 0, {
      message: 'Weight is min 0',
    });
    min(schemaPath.gastroDetails.edition, 1, {
      message: 'Edition is min 1',
    });
  });

  handleSave() {
    if (this.editForm().invalid()) return;
    this.commonSave.emit({
      id: this.idBook(),
      dataToSave: this.editForm().value(),
    });
  }

  handleClose() {
    this.closeModal.emit();
  }
}
