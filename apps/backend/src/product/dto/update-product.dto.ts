import type { ProductType } from '@store/libs';
import {
  IsString,
  IsNumber,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { BookDto, GameDto, GastroDto, GiftCardDto } from './create-product.dto';
import { Type } from 'class-transformer';

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

  @IsOptional()
  @ValidateNested()
  @Type(() => BookDto)
  bookDetails?: BookDto | null;

  @IsOptional()
  @ValidateNested()
  @Type(() => GameDto)
  gameDetails?: GameDto | null;

  @IsOptional()
  @ValidateNested()
  @Type(() => GastroDto)
  gastroDetails?: GastroDto | null;

  @IsOptional()
  @ValidateNested()
  @Type(() => GiftCardDto)
  cardDetails?: GiftCardDto | null;
}
