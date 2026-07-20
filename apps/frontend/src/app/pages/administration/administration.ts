import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { BookTable } from '../../components/book-table/book-table';
import { CommonModule } from '@angular/common';
import { Product } from '@store/shared-models';
import { AppStore } from '../../store/app-store';
import { EditBookModalComponent } from './edit-book-modal';
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
    EditBookModalComponent,
    OrderTable,
    TranslocoDirective,
    CoverModalComponent,
    DeleteModalComponent,
    LucideFrown,
  ],
  templateUrl: './administration.html',
  styleUrl: './administration.css',
})
export class Administration implements OnInit {
  store = inject(AppStore);

  selectedProduct = signal<Product | null>(null);
  isCoverModalOpen = signal<boolean>(false);
  isDeleteModalOpen = signal(false);
  isEditModalOpen = signal(false);

  ngOnInit() {
    if (this.store.isAdmin()) {
      const userId = this.store.user()?.id;
      if (userId) {
        this.store.reloadOrders({ userId });
      }
    }
  }

  category = computed(() => {
    if (this.store.isBook()) {
      return 'Book';
    } else if (this.store.isGame()) {
      return 'Game';
    } else if (this.store.isGastro()) {
      return 'Gastro';
    } else {
      return 'Nothing found';
    }
  });

  openDeleteConfirmation(product: Product) {
    this.selectedProduct.set(product);
    this.isDeleteModalOpen.set(true);
  }

  openCoverModal(product: Product) {
    this.selectedProduct.set(product);
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

  openEditModal(product: Product) {
    this.selectedProduct.set(product);
    this.isEditModalOpen.set(true);
  }

  handleProductSave(event: {
    id: string | null | undefined;
    dataToSave: Partial<Product>;
  }) {
    const id = event.id;
    const dataToSave = event.dataToSave;
    dataToSave.createdAt = dataToSave.createdAt ?? new Date().toISOString();
    dataToSave.updatedAt = dataToSave.updatedAt ?? new Date().toISOString();

    this.store.saveBook({ id, data: dataToSave });
  }
}
