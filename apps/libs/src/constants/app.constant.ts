import { ProductType } from '@store/libs';

export const DEFAULT_LOADER_DELAY = 1000;
export const DEFAULT_MAX_LIMIT = 12;
export const DEFAULT_PAGE = 1;
export const DEFAULT_TYPE = 'BOOK' as ProductType;
export const DEFAULT_SEARCH = '';

export const VIEW_LAYOUTS = ['grid', 'list'] as const;
// This automatically creates the type: 'grid' | 'list'
export type ViewLayout = (typeof VIEW_LAYOUTS)[number];
