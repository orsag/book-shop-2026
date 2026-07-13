export type ProductType =
  | 'BOOK'
  | 'GAME'
  | 'GASTRO'
  | 'GIFT_CARD';

export interface Product {
  id: string;
  sku: string;
  name: string;
  alternativeHeadline: string;
  description: string;
  price: number;
  discount: number; // default: 0
  availableCount: number; // default: 0
  isAvailable: boolean; // default: true
  product_quality: string;
  coverUrl?: string | null;

  // Type discriminator
  productType: ProductType;

  // Shared Relations
  rating?: AggregateRating | null;

  // Extension Relations (Optional)
  bookDetails?: BookDetails | null;
  gameDetails?: GameDetails | null;
  gastroDetails?: GastroDetails | null;
  cardDetails?: GiftCardDetails | null;

  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface BookDetails {
  id: string;
  productId: string;

  author: string;
  isbn: string;
  publisher: string;
  pageCount: number;
  bookFormat: string;
  category: string;
  binding: string;
  publishedDate: Date;
  audioBook: boolean;
  audioLength: number;
  audioLanguage?: string;
}

export interface GameDetails {
  id: string;
  productId: string;
  category: string;
  brand: string;

  playersMin: number;
  playersMax: number;
  playTimeMinutes: number;
  producer: string;
}

export interface GastroDetails {
  id: string;
  productId: string;
  producer: string;
  category: string;
  brand: string;
  binding: string;
  edition: number;
  weight: number;
}

export interface GiftCardDetails {
  id: string;
  productId: string;
  price: number;
  priceCurrency: string;
}

export interface AggregateRating {
  id: string;
  ratingValue: number;
  ratingCount: number;
  bestRating: number;
  worstRating: number;
  productId: string;
}

// You can also create a type for creating a new book (without the ID)
export type CreateBookDto = Omit<Product, 'id'>;

export interface UpdateProductDto {
  name: string;
  alternativeHeadline: string;
  description: string;
  price: number;
  discount: number;
  isAvailable: boolean;
  availableCount: number;
  product_quality: string;
  productType: ProductType;
  bookDetails?: BookDetails;
  gameDetails?: GameDetails;
  gastroDetails?: GastroDetails;
}

export interface ActionResponse {
  success: boolean;
  message: string;
  warning?: boolean;
}

export interface FindAllParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  isBestSeller?: boolean;
  newReleases?: boolean;
  isAvailable?: boolean;
  isDiscounted?: boolean;
  sortBy?: 'price_asc' | 'price_desc';
}
