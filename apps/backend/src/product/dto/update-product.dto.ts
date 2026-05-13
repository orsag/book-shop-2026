import type { ProductType } from '@store/libs';
import { IsString, IsNumber } from 'class-validator';
import { BookDto, GameDto, GastroDto, GiftCardDto } from './create-product.dto';

export class UpdateProductDto implements UpdateProductDto {
  @IsString()
  name: string;
  @IsString()
  alternativeHeadline: string;
  @IsString()
  description: string;
  @IsNumber()
  price: number;
  @IsNumber()
  discount: number;
  @IsNumber()
  availableCount: number;
  @IsString()
  availability: string;
  @IsNumber()
  deliveryLeadTime: number;
  @IsString()
  product_quality: string;
  @IsString()
  productType: ProductType;

  bookDetails?: BookDto | null;
  gameDetails?: GameDto | null;
  gastroDetails?: GastroDto | null;
  cardDetails?: GiftCardDto | null;
}
