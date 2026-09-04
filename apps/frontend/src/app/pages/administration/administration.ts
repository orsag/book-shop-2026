import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { BookTable, OrderTable } from '@component';
import { CommonModule } from '@angular/common';
import { CreateProductDto as IProduct } from '@api';
import { AppStore, UserStore, CartStore } from '@store';
import { EditBookModalComponent } from './edit-book-modal';
import { TranslocoDirective } from '@jsverse/transloco';
import { CoverModalComponent } from './cover-modal';
import { DeleteModalComponent } from './delete-modal';
import { LucideFaceSlightlyFrowning, LucidePlus } from '@lucide/angular';
import { LoadingService, RedFocusDirective } from '@core';
import { RouterLink } from '@angular/router';
import { EditBookReactiveComponent } from './edit-book-reactive';

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
    RedFocusDirective,
    RouterLink,
    EditBookReactiveComponent,
    LucideFaceSlightlyFrowning,
  ],
  templateUrl: './administration.html',
  styleUrl: './administration.css',
})
export class Administration implements OnInit {
  store = inject(AppStore);
  userStore = inject(UserStore);
  cartStore = inject(CartStore);
  loading = inject(LoadingService);

  selectedProduct = signal<IProduct | null>(null);
  isCoverModalOpen = signal<boolean>(false);
  isDeleteModalOpen = signal(false);
  isEditModalOpen = signal(false);
  newVersion = signal(false);

  ngOnInit() {
    if (this.userStore.isAdmin()) {
      const userId = this.userStore.user()?.id;
      if (userId) {
        this.cartStore.reloadOrders({ userId });
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

  openDeleteConfirmation(product: IProduct) {
    this.selectedProduct.set(product);
    this.isDeleteModalOpen.set(true);
  }

  openCoverModal(product: IProduct) {
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

  openEditModal(product: IProduct) {
    this.selectedProduct.set(product);
    this.isEditModalOpen.set(true);
  }

  handleProductSave(event: {
    id: string | null | undefined;
    dataToSave: Partial<IProduct>;
  }) {
    const id = event.id;
    const dataToSave = event.dataToSave;

    this.store.saveBook({ id, data: dataToSave });
    this.closeModals();
  }
}
