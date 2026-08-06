import { Pipe, PipeTransform } from '@angular/core';
import { CreateProductDto as IProduct } from '@api';

type Item = {
  productId: string;
  quantity: number;
  price: number;
  product: IProduct;
};

@Pipe({
  name: 'totalPrice',
  pure: true, // This is true by default, meaning it memoizes!
})
export class TotalPricePipe implements PipeTransform {
  transform(item: Item): number {
    return item.quantity * (item.product.price * (1 - item.product.discount));
  }
}
