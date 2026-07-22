import {
  Component,
  inject,
  output,
  input,
  signal,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '@store/libs';
import { AppStore } from '@store';
import { BookService, ImageUploadService } from '@service';
import { ErrorCodes, ErrorService, NoFocusJumpDirective } from '@core';
import { TranslocoDirective, TranslocoPipe } from '@jsverse/transloco';
import { LucideImageUp } from '@lucide/angular';

@Component({
  selector: 'app-cover-modal',
  standalone: true,
  imports: [
    CommonModule,
    TranslocoDirective,
    TranslocoPipe,
    LucideImageUp,
    NoFocusJumpDirective,
  ],
  template: `
    <dialog *transloco="let t" class="modal modal-open">
      <div class="modal-box border border-primary">
        <h3 class="font-bold text-lg text-primary">
          {{ t('administration.upload') }}
        </h3>
        <p class="py-4 text-sm text-base-content/70">
          {{ t('administration.upload2') }}
        </p>

        <div class="form-control w-full">
          <input
            appNoFocusJump
            type="file"
            #fileInput
            class="hidden"
            (change)="onFileSelected($event)"
            accept="image/*"
          />

          <div class="flex items-center gap-4">
            <button
              type="button"
              class="btn btn-outline btn-primary"
              (click)="fileInput.click()"
            >
              <svg lucideImageUp size="20"></svg>
              {{ 'administration.select_file_btn' | transloco }}
            </button>

            <span class="text-sm text-base-content/50">
              {{
                selectedFile()
                  ? selectedFile()?.name
                  : ('administration.no_file_chosen' | transloco)
              }}
            </span>
          </div>
        </div>

        @if (previewUrl()) {
          <div class="mt-6 flex justify-center">
            <div
              class="shadow-2xl rounded-xl overflow-hidden border border-base-300"
              style="max-width: 350px; max-height: 600px;"
            >
              <img
                [src]="previewUrl()"
                alt="Cover Preview"
                class="w-full h-full object-contain block rounded-xl"
              />
            </div>
          </div>
        }

        <div class="modal-action">
          <button class="btn btn-ghost" (click)="handleClose()">
            {{ t('administration.cancel_btn') }}
          </button>
          <button
            class="btn btn-primary"
            [disabled]="!selectedFile()"
            (click)="handleUpload()"
          >
            {{ t('administration.upload_btn') }}
          </button>
        </div>
      </div>

      <div
        class="modal-backdrop bg-black/40"
        role="button"
        tabindex="0"
        aria-label="Zatvoriť okno"
        (click)="handleClose()"
      ></div>
    </dialog>
  `,
})
export class CoverModalComponent {
  // Inputs & Outputs
  closeModal = output<void>();
  readonly selectedBook = input.required<Product | null>();

  // Injections
  store = inject(AppStore);
  bookService = inject(BookService);
  errorService = inject(ErrorService);
  uploadService = inject(ImageUploadService);

  // State Signals
  selectedFile = signal<File | null>(null);
  previewUrl = signal<string | null>(null);

  constructor() {
    // Sync initial preview with existing coverUrl if it exists
    effect(() => {
      const book = this.selectedBook();
      if (book?.coverUrl) {
        this.previewUrl.set(book.coverUrl);
      }
    });
  }

  handleClose() {
    this.closeModal.emit();
    this.selectedFile.set(null);
    this.previewUrl.set(null);
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      this.selectedFile.set(file);
      const reader = new FileReader();
      reader.onload = () => this.previewUrl.set(reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  handleUpload() {
    const bookId = this.selectedBook()?.id;
    const file = this.selectedFile();

    if (!file || !bookId) return;

    this.uploadService.uploadImage(file).subscribe({
      next: (res) => {
        // Prepend localhost as required by your current backend validator
        const absoluteUrl = `http://localhost:3000${res.url}`;

        this.bookService.update(bookId, { coverUrl: absoluteUrl }).subscribe({
          next: (updatedBook) => {
            console.log('Book updated successfully:', updatedBook);
            this.handleClose();
          },
          error: () => this.errorService.handleError(ErrorCodes.PRODUCT_UPDATE),
        });
      },
      error: () => this.errorService.handleError(ErrorCodes.PRODUCT_UPDATE),
    });
  }
}
