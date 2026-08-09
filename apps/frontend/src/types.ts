import { CreateProductDto as IProduct } from '@api';
import { CreateProductDtoProductType as ProductType } from '@api';

export interface BookFilters {
  type: ProductType;
  search: string;
  // isAvailable: boolean;
  // isBestSeller: boolean;
  // isNewRelease: boolean;
  isDiscounted: boolean;
  category: string | null;
}

export interface PaginatedProducts {
  data: IProduct[];
  meta: {
    total: number;
    page: number;
    lastPage: number;
    count: number;
  };
}
