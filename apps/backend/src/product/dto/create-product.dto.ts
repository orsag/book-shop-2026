import type { BookDetails, Product, ProductType } from '@store/libs';
import {
  IsString,
  IsNumber,
  IsBoolean,
  IsIn,
  IsOptional,
  Max,
  Min,
} from 'class-validator';

export class AggregateRatingDto {
  @IsString()
  id: string;
  @IsNumber()
  ratingValue: number;
  @IsNumber()
  ratingCount: number;
  @IsNumber()
  bestRating: number;
  @IsNumber()
  worstRating: number;
  @IsString()
  productId: string;
}

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
  pageCount!: number;
  @IsString()
  bookFormat!: string;
  @IsString()
  category!: string;
  @IsString()
  binding!: string;
  @IsString()
  publishedDate!: Date;
  @IsBoolean()
  audioBook!: boolean;
  @IsNumber()
  audioLength!: number;
  @IsOptional()
  @IsString()
  audioLanguage?: string | null;
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
  id!: string;
  @IsString()
  sku!: string;
  @IsString()
  name!: string;
  @IsString()
  alternativeHeadline!: string;
  @IsOptional()
  @IsString()
  description?: string | null;
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
  availability!: string;
  @IsNumber()
  deliveryLeadTime!: number;
  @IsString()
  product_quality?: string | null;
  @IsOptional()
  @IsString()
  coverUrl?: string | null;
  @IsString()
  @IsIn(['BOOK', 'GAME', 'GASTRO', 'GIFT_CARD'], {
    message: 'category must be one of: BOOK, GAME, GASTRO, GIFT_CARD',
  })
  productType!: ProductType;

  // Relations (optional for partial DTOs or loaded relations)
  rating?: AggregateRatingDto | null;
  bookDetails?: BookDetails | null;
  gameDetails?: GameDto | null;
  gastroDetails?: GastroDto | null;
  cardDetails?: GiftCardDto | null;
  @IsString()
  createdAt!: Date;
  @IsString()
  updatedAt!: Date;
}
