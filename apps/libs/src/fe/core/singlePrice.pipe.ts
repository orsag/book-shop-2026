import { Pipe, PipeTransform } from '@angular/core';
import { CreateProductDto as IProduct } from '@api';

@Pipe({
  name: 'singlePrice',
  pure: true, // This is true by default, meaning it memoizes!
})
export class SinglePricePipe implements PipeTransform {
  transform(product: IProduct): number {
    return product.price * (1 - product.discount);
  }
}
