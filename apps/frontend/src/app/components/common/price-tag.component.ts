import { Component, computed, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { TranslocoDirective } from '@jsverse/transloco';

@Component({
  selector: 'app-price-tag',
  standalone: true,
  imports: [DecimalPipe, TranslocoDirective],
  templateUrl: './price-tag.component.html',
})
export class PriceTagComponent {
  price = input.required<number>();
  // Input is now 0 to 1 (e.g., 0.1 for 10%)
  discount = input<number>(0);

  hasDiscount = computed(() => this.discount() > 0);

  // Conversion for the UI display (e.g., 0.1 -> 10)
  discountPercentage = computed(() => Math.round(this.discount() * 100));

  discountedPrice = computed(() => {
    return this.price() * (1 - this.discount());
  });

  savedAmount = computed(() => {
    return this.price() - this.discountedPrice();
  });
}
