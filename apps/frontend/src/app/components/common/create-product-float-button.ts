import { Component, output, inject } from '@angular/core';
import { LucideBlocks } from '@lucide/angular';
import { AppStore } from '../../store/app-store';

@Component({
  selector: 'app-create-product-btn',
  standalone: true,
  imports: [LucideBlocks],
  template: `
    <button
      (click)="generateProductData()"
      class="btn btn-circle btn-primary btn-lg shadow-xl fixed bottom-8 right-8
      z-[9999] transition-transform hover:scale-110 active:scale-95 hover:ring-4 hover:ring-primary/30"
    >
      <svg lucideBlocks size="30"></svg>
    </button>
  `,
})
export class CreateProductButton {
  store = inject(AppStore);
  newProduct = output<void>();

  generateProductData() {
    this.newProduct.emit();
  }
}
