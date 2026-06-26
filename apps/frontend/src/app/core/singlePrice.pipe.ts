import { Pipe, PipeTransform } from '@angular/core';
import { Product } from '@store/libs';

type Item = {
  productId: string;
  quantity: number;
  price: number;
  product: Product;
};

@Pipe({
  name: 'singlePrice',
  pure: true, // This is true by default, meaning it memoizes!
})
export class SinglePricePipe implements PipeTransform {
  transform(item: Item): number {
    return item.product.price * (1 - item.product.discount);
  }
}
