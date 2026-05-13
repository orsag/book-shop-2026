import { Product as IProduct, ProductType } from '@store/libs';

export interface BookFilters {
  type: ProductType;
  search: string;
  // isAvailable: boolean;
  // isBestSeller: boolean;
  // isNewRelease: boolean;
  isDiscounted: boolean;
  category: string | null;
}

export type QuickFilterState = {
  mode: 'all' | 'bestSellers' | 'newReleases' | 'discounted' | 'soldOut';
  sortBy: 'price_asc' | 'price_desc' | null;
};

export interface PaginatedProducts {
  data: IProduct[];
  meta: {
    total: number;
    page: number;
    lastPage: number;
    count: number;
  };
}

// Define a type for your filter/sort items
export type FilterItem = {
  label: string;
  icon: string;
  isActive: () => boolean;
  action: () => void;
  style: 'warning' | 'outline'; // To distinguish your specific button styles
};
