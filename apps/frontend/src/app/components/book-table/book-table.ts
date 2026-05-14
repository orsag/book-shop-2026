import { Component, computed, inject, output, Signal } from '@angular/core';
import { Product } from '@store/shared-models';
import { RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { AppStore } from '../../store/app-store';
import { TranslocoDirective } from '@jsverse/transloco';
import {
  LucideTrash2,
  LucidePencil,
  LucideImagePlus,
  LucideChevronsRight,
} from '@lucide/angular';

@Component({
  selector: 'app-book-table',
  imports: [
    RouterLink,
    CurrencyPipe,
    DatePipe,
    TranslocoDirective,
    LucideTrash2,
    LucidePencil,
    LucideImagePlus,
    LucideChevronsRight,
  ],
  templateUrl: './book-table.html',
  styleUrl: './book-table.css',
})
export class BookTable {
  store = inject(AppStore);
  edit = output<Product>();
  remove = output<Product>();
  editCover = output<Product>();

  products: Signal<Product[]> = this.store.products;

  dynamicColumns = computed(() => {
    if (this.store.isBook()) {
      return {
        columnOne: 'book_table.publisher',
        columnTwo: 'book_table.isbn',
      };
    } else {
      return {
        columnOne: 'book_table.brand',
        columnTwo: 'book_table.category',
      };
    }
  });

  handleEdit(book: Product) {
    this.edit.emit(book);
  }

  handleEditCover(book: Product) {
    this.editCover.emit(book);
  }

  handleDelete(book: Product) {
    this.remove.emit(book);
  }
}
