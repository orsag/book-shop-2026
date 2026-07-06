import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Filter } from './filter';
import { getTranslocoModule } from '../../core/transloco-testing.module';
import { AppStore } from '../../store/app-store';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';
import { ConfigurationService } from '../../services/configuration-service';
import { ScrollService } from '../../services/scroll-service';
import {
  DEFAULT_MAX_LIMIT,
  DEFAULT_PAGE,
  DEFAULT_SEARCH,
  DEFAULT_TYPE,
} from '@store/libs';
import { signal, computed } from '@angular/core';

describe('Filter', () => {
  let component: Filter;
  let mockAppStore: any;
  let mockConfigService: any;
  let mockScrollService: any;
  let fixture: ComponentFixture<Filter>;

  beforeEach(async () => {
    mockAppStore = {
      filters: signal({
        type: DEFAULT_TYPE,
        page: DEFAULT_PAGE,
        limit: DEFAULT_MAX_LIMIT,
        search: DEFAULT_SEARCH,
        category: null,
        sortBy: null,
        isDiscounted: false,
      }),
      products: signal([]),
      isBook: computed(() => true),
      isMobile: computed(() => false),
      viewLayout: signal('list'),
      toggleSort: vi.fn(),
      totalProducts: computed(() => 10),
      updateFilters: vi.fn(),
      addToHistory: vi.fn(),
      setViewLayout: vi.fn(),
      searchHistory: vi.fn().mockReturnValue([]),
    };

    mockConfigService = {
      toggleFlag: vi.fn(),
      flags: vi.fn().mockReturnValue({
        SHOW_FILTER: true,
      }),
    };

    mockScrollService = {
      scrollToTop: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [Filter, getTranslocoModule()],
      providers: [
        provideRouter([]),
        { provide: AppStore, useValue: mockAppStore },
        { provide: ConfigurationService, useValue: mockConfigService },
        { provide: ScrollService, useValue: mockScrollService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Filter);
    component = fixture.componentInstance;
    (component as any).VIEW_LAYOUTS = ['grid', 'list'];
    (component as any).CATEGORIES = MOCK_CATEGORIES;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render all categories', async () => {
    // 1. Ensure the component property matches the template's property loop
    component.bookCategories = MOCK_CATEGORIES;

    // 2. Trigger change detection to update the template
    fixture.detectChanges();

    // 3. Query all labels or text spans within the category loop
    const categoryElements =
      fixture.nativeElement.querySelectorAll('span.category');

    // 4. Assert that the rendered count matches the array length
    expect(categoryElements.length).toBe(MOCK_CATEGORIES.length);

    // 5. Verify that each category string is actually rendered in order
    MOCK_CATEGORIES.forEach((category, index) => {
      expect(categoryElements[index].textContent.trim()).toBe(category);
    });
  });
});

const MOCK_CATEGORIES = [
  'Fiction',
  'Non-fiction',
  'Fantasy',
  'Sci-Fi',
  'Romance',
  'History',
  'Biography',
  'Self-help',
  'Mystery',
];
