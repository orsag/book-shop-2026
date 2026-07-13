import type { Product, ProductType } from '@store/libs';
import {
  IsString,
  IsNumber,
  IsBoolean,
  IsIn,
  IsOptional,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

// export class AggregateRatingDto {
//   @IsString()
//   id: string;
//   @IsNumber()
//   ratingValue: number;
//   @IsNumber()
//   ratingCount: number;
//   @IsNumber()
//   bestRating: number;
//   @IsNumber()
//   worstRating: number;
//   @IsString()
//   productId: string;
// }

export class BookDto {
  @IsString()
  id!: string;
  @IsString()
  productId!: string;
  @IsString()
  author!: string;
  @IsString()
  isbn!: string;
  @IsString()
  publisher!: string;
  @IsNumber()
  pageCount!: number;
  @IsString()
  bookFormat!: string;
  @IsString()
  category!: string;
  @IsString()
  binding!: string;
  @IsString()
  publishedDate!: Date;
  @IsOptional()
  @IsBoolean()
  audioBook!: boolean;
  @IsOptional()
  @IsNumber()
  audioLength!: number;
  @IsOptional()
  @IsString()
  audioLanguage?: string;
}

export class GameDto {
  @IsString()
  id!: string;
  @IsString()
  productId!: string;
  @IsString()
  category!: string;
  @IsString()
  brand!: string;
  @IsNumber()
  playersMin!: number;
  @IsNumber()
  playersMax!: number;
  @IsNumber()
  playTimeMinutes!: number;
  @IsString()
  producer!: string;
}

export class GastroDto {
  @IsString()
  id!: string;
  @IsString()
  productId!: string;
  @IsString()
  producer!: string;
  @IsString()
  category!: string;
  @IsString()
  brand!: string;
  @IsString()
  binding!: string;
  @IsNumber()
  edition!: number;
  @IsNumber()
  weight!: number;
}

export class GiftCardDto {
  @IsString()
  id!: string;
  @IsString()
  productId!: string;
  @IsNumber()
  price!: number;
  @IsString()
  priceCurrency!: string;
}

export class CreateProductDto implements Product {
  @IsString()
  id: string = 'default-id-123';
  @IsString()
  sku: string = '27Z6SGMY';
  @IsString()
  name!: string;
  @IsString()
  alternativeHeadline!: string;
  @IsString()
  description!: string;
  @IsNumber()
  price!: number;
  @IsNumber()
  @Min(0)
  @Max(1)
  discount!: number;
  @IsNumber()
  availableCount!: number;
  @IsBoolean()
  isAvailable!: boolean;
  @IsString()
  product_quality!: string;
  @IsOptional()
  @IsString()
  coverUrl?: string | null;
  @IsString()
  @IsIn(['BOOK', 'GAME', 'GASTRO', 'GIFT_CARD'], {
    message: 'category must be one of: BOOK, GAME, GASTRO, GIFT_CARD',
  })
  productType!: ProductType;

  // Relations (optional for partial DTOs or loaded relations)
  // @IsOptional()
  // @ValidateNested()
  // @Type(() => AggregateRatingDto)
  // rating?: AggregateRatingDto | null;

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
  @IsString()
  createdAt: Date = new Date();
  @IsString()
  updatedAt: Date = new Date();
}
