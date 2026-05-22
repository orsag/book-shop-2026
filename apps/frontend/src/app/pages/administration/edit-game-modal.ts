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
import { form, min, max } from '@angular/forms/signals';
import {
  Product,
  UpdateProductDto,
  EMPTY_GAME,
  GameDetails,
  CATEGORIES,
} from '@store/libs';
import { GAME_CATEGORIES } from '@store/shared-models';
import { AppStore } from '../../store/app-store';
import { TranslocoDirective } from '@jsverse/transloco';
import { FormFieldComponent } from '../../components/form-field/form-field';
import { applyCommonProductRules } from './form-rules.shared';

type UpdateProductDtoFrontend = Omit<UpdateProductDto, 'gameDetails'> & {
  gameDetails: NonNullable<UpdateProductDto['gameDetails']>;
};

@Component({
  selector: 'app-edit-game-modal',
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
            [control]="editForm.gameDetails.producer"
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
            [control]="editForm.gameDetails.category"
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

          <!-- playersMin -->
          <app-form-field
            type="number"
            step="1"
            [control]="editForm.gameDetails.playersMin"
            [inputId]="'playersMin-' + idBook"
            [label]="t('edit_modal.playersMin')"
          />

          <!-- playersMax -->
          <app-form-field
            type="number"
            step="1"
            [control]="editForm.gameDetails.playersMax"
            [inputId]="'playersMax-' + idBook"
            [label]="t('edit_modal.playersMax')"
          />

          <!-- playTimeMinutes -->
          <app-form-field
            type="number"
            step="1"
            [control]="editForm.gameDetails.playTimeMinutes"
            [inputId]="'playTimeMinutes-' + idBook"
            [label]="t('edit_modal.playTimeMinutes')"
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
export class EditGameModalComponent {
  closeModal = output<void>();
  commonSave = output<{
    id: string | undefined;
    dataToSave: Partial<Product>;
  }>();
  readonly selectedBook = input.required<Product | null>();
  store = inject(AppStore);

  editModel = signal<UpdateProductDtoFrontend>({
    ...(EMPTY_GAME as UpdateProductDtoFrontend),
  });
  readonly idBook = computed(() => this.selectedBook()?.id);

  productCategories = GAME_CATEGORIES;
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
          const details = book.gameDetails
            ? book.gameDetails
            : (EMPTY_GAME.gameDetails as GameDetails);

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
            gameDetails: { ...details },
          });
        });
      }
    });
  }

  editForm = form(this.editModel, (schemaPath) => {
    // Common rules
    applyCommonProductRules(schemaPath);

    max(schemaPath.gameDetails.playersMax, 10, {
      message: 'Maximal 10 player',
    });
    min(schemaPath.gameDetails.playersMin, 1, {
      message: 'Minimal 1 player',
    });
    min(schemaPath.gameDetails.playTimeMinutes, 10, {
      message: 'Minimal playTimeMinutes 10',
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

  protected readonly bookCategories = CATEGORIES;
}
