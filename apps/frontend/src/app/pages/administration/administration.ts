import { Component, computed, inject, signal } from '@angular/core';
import { BookTable } from '../../components/book-table/book-table';
import { CommonModule } from '@angular/common';
import { Product } from '@store/shared-models';
import { AppStore } from '../../store/app-store';
import { EditModalComponent } from './edit-book-modal';
import { OrderTable } from '../../components/order-table/order-table';
import { TranslocoDirective } from '@jsverse/transloco';
import { CoverModalComponent } from './cover-modal';
import { DeleteModalComponent } from './delete-modal';
import { LucideFrown, LucidePlus } from '@lucide/angular';

@Component({
  selector: 'app-administration',
  imports: [
    BookTable,
    LucidePlus,
    CommonModule,
    EditModalComponent,
    OrderTable,
    TranslocoDirective,
    CoverModalComponent,
    DeleteModalComponent,
    LucideFrown,
  ],
  templateUrl: './administration.html',
  styleUrl: './administration.css',
})
export class Administration {
  store = inject(AppStore);

  selectedProduct = signal<Product | null>(null);
  isCoverModalOpen = signal<boolean>(false);
  isDeleteModalOpen = signal(false);
  isEditModalOpen = signal(false);

  category = computed(() => {
    if (this.store.isBook()) {
      return 'Book';
    } else if (this.store.isGame()) {
      return 'Game';
    } else if (this.store.isGastro()) {
      return 'Gastro';
    } else {
      return 'Puzzle / Cups / Toys';
    }
  });

  openDeleteConfirmation(book: Product) {
    this.selectedProduct.set(book);
    this.isDeleteModalOpen.set(true);
  }

  openCoverModal(book: Product) {
    this.selectedProduct.set(book);
    this.isCoverModalOpen.set(true);
  }

  closeModals() {
    this.isCoverModalOpen.set(false);
    this.isDeleteModalOpen.set(false);
    this.isEditModalOpen.set(false);
    this.selectedProduct.set(null);
  }

  openCreateModal() {
    this.selectedProduct.set(null);
    this.isEditModalOpen.set(true);
  }

  openEditModal(book: Product) {
    if (this.selectedProduct()?.productType === 'BOOK') {
      this.selectedProduct.set(book);
      this.isEditModalOpen.set(true);
    }
  }
}
