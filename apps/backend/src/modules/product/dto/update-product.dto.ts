import { CreateProductDtoProductType } from '@book-store-2026/libs';
import {
  IsString,
  IsNumber,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { BookDto, GameDto, GastroDto, GiftCardDto } from './create-product.dto';
import { Type } from 'class-transformer';

export class UpdateProductDto implements UpdateProductDto {
  @IsOptional()
  @IsString()
  name?: string;
  @IsOptional()
  @IsString()
  alternativeHeadline?: string;
  @IsOptional()
  @IsString()
  description?: string;
  @IsOptional()
  @IsNumber()
  price?: number;
  @IsOptional()
  @IsNumber()
  discount?: number;
  @IsOptional()
  @IsNumber()
  availableCount?: number;
  @IsOptional()
  @IsString()
  product_quality?: string;
  @IsOptional()
  @IsString()
  productType?: CreateProductDtoProductType;

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
