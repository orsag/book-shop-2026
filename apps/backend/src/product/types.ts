import { ProductType } from '@store/libs';

export interface FindAllParams {
  type: ProductType;
  page: number;
  limit: number;
  search?: string;
  category?: string;
  sortBy?: 'price_asc' | 'price_desc';
  isDiscounted?: boolean;
}
