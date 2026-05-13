export type ProductType = 'BOOK' | 'GAME' | 'GASTRO' | 'GIFT_CARD' | 'PUZZLE' | 'CARDS' | 'TOYS';
export interface Product {
    id: string;
    sku: string;
    name: string;
    alternativeHeadline: string;
    description?: string | null;
    price: number;
    discount: number;
    availableCount: number;
    isAvailable: boolean;
    availability: string;
    deliveryLeadTime: number;
    product_quality?: string | null;
    coverUrl?: string | null;
    productType: ProductType;
    rating?: AggregateRating | null;
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
export type CreateBookDto = Omit<Product, 'id'>;
export interface UpdateProductDto {
    name: string;
    alternativeHeadline: string;
    description: string;
    price: number;
    discount: number;
    availableCount: number;
    availability: string;
    deliveryLeadTime: number;
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
