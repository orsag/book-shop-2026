import { ProductType } from '@store/libs';

export const DEFAULT_LOADER_DELAY = 1000;
export const DEFAULT_MAX_LIMIT = 12;
export const DEFAULT_PAGE = 1;
export const DEFAULT_TYPE = 'BOOK' as ProductType;
export const DEFAULT_SEARCH = '';

export const VIEW_LAYOUTS = ['grid', 'list'] as const;
// This automatically creates the type: 'grid' | 'list'
export type ViewLayout = (typeof VIEW_LAYOUTS)[number];

export const FOOTER_ITEMS = [
  { translationKey: 'footer.apps', image: '/images/ereader.png', alt: 'Ereader' },
  { translationKey: 'footer.audiobooks', image: '/images/audiobook.png', alt: 'Audiobooks' },
  { translationKey: 'footer.blog', image: '/images/blog.png', alt: 'blog' },
  { translationKey: 'footer.podcast', image: '/images/podcast.png', alt: 'podcast' },
  { translationKey: 'footer.membership', image: '/images/membership.png', alt: 'membership' },
  { translationKey: 'footer.pickup', image: '/images/box.png', alt: 'pickup', isSplit: true },
  { translationKey: 'footer.gift', image: '/images/gift-card.png', alt: 'gift-card' },
  { translationKey: 'footer.stores', image: '/images/shop.png', alt: 'stores' },
  { translationKey: 'footer.mastercard', image: '/images/mastercard.png', alt: 'mastercard' }
];
