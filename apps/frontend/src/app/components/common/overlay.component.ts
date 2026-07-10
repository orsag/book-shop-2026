import { Component, inject, Input } from '@angular/core';
import { Product } from '@store/shared-models';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-overlay',
  imports: [CommonModule],
  templateUrl: './overlay.component.html',
})
export class OverlayComponent {
  @Input({ required: true }) product!: Product;
  /*
    id: string
  sku: string
  name: string
  alternativeHeadline: string
  description: string
  price: number
  discount: number
  availableCount: number
  isAvailable: boolean
  product_quality: string
  coverUrl?: string | null
  productType: ProductType
  rating?: AggregateRating | null
   */
}
