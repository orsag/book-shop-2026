import { Pipe, PipeTransform } from '@angular/core';
import { Product } from '@store/libs';

@Pipe({
  name: 'singlePrice',
  pure: true, // This is true by default, meaning it memoizes!
})
export class SinglePricePipe implements PipeTransform {
  transform(product: Product): number {
    return product.price * (1 - product.discount);
  }
}
