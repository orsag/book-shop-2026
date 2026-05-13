import { Component, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoDirective } from '@jsverse/transloco';
import { ActionResponse, Product } from '@store/libs';
import {
  ErrorCodes,
  ErrorHandlerService,
  SuccessCodes,
} from '../../core/error.handler';
import { BookService } from '../../services/book-service';
import { AppStore } from '../../store/app-store';

@Component({
  selector: 'app-delete-modal',
  standalone: true,
  imports: [CommonModule, TranslocoDirective],
  template: `
    <dialog *transloco="let t" class="modal modal-open">
      <div class="modal-box border border-error/20">
        <h3 class="font-bold text-lg text-error">
          {{ t('administration.delete_book') }}
        </h3>
        <p class="py-4">
          {{ t('administration.delete_book2') }}
          <strong>{{ selectedBook()?.name }}</strong
          >?
        </p>
        <div class="modal-action">
          <button class="btn btn-ghost" (click)="handleClose()">
            {{ t('administration.cancel_btn') }}
          </button>
          <button class="btn btn-error text-white" (click)="confirmDelete()">
            {{ t('administration.delete_btn') }}
          </button>
        </div>
      </div>
      <div
        class="modal-backdrop"
        role="button"
        tabindex="0"
        aria-label="Zatvoriť okno"
        (click)="handleClose()"
        (keydown.enter)="handleClose()"
        (keydown.space)="handleClose()"
      ></div>
    </dialog>
  `,
})
export class DeleteModalComponent {
  closeModal = output<void>();
  readonly selectedBook = input.required<Product | null>();

  store = inject(AppStore);
  bookService = inject(BookService);
  errorService = inject(ErrorHandlerService);

  confirmDelete() {
    const bookId = this.selectedBook()?.id;

    if (bookId) {
      this.bookService.delete(bookId).subscribe((res: ActionResponse) => {
        if (res.warning) {
          this.errorService.handleError(ErrorCodes.BOOK_DELETE);
        } else {
          this.errorService.handleSuccess(SuccessCodes.BOOK_DELETE);
          this.store.loadBooks();
        }
      });
    }

    this.handleClose();
  }

  handleClose() {
    this.closeModal.emit();
  }
}
