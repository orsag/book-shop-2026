export const FEATURES: Record<string, { label: string; defaultValue: boolean }> = {
  INFINITE_SCROLL_GRID: {
    label: 'Enable infinite scrolling on dashboard grid',
    defaultValue: false,
  },
  INFINITE_SCROLL_LIST: {
    label: 'Enable infinite scrolling on dashboard list',
    defaultValue: false,
  },
  INFINITE_COLOR_THEMES: {
    label: 'Enable all possible color themes',
    defaultValue: true,
  },
  SHOW_FILTER: {
    label: 'Show filter component',
    defaultValue: false,
  },
  SHOW_SEARCHBAR_HEADER: {
    label: 'Show search bar inside navigation bar',
    defaultValue: false,
  },
  SHOW_DISCOUNT_BANNER: {
    label: 'Show discount banner',
    defaultValue: false,
  },
} as const;

// This maps the 'name' literal values into a concrete interface
export type FeatureName =
  | 'INFINITE_SCROLL_GRID'
  | 'INFINITE_SCROLL_LIST'
  | 'INFINITE_COLOR_THEMES'
  | 'SHOW_FILTER'
  | 'SHOW_SEARCHBAR_HEADER'
  | 'SHOW_DISCOUNT_BANNER';
