import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Filter } from './filter';
import { getTranslocoModule } from '@core';
import { AppStore } from '@store';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';
import { ConfigurationService, ScrollService } from '@service';
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
      isDarkTheme: vi.fn().mockReturnValue(false),
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
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render all categories when content is visible', () => {
    component.isContentVisible.set(true);
    fixture.detectChanges();

    const categoryElements =
      fixture.nativeElement.querySelectorAll('.filter-category-label');
    expect(categoryElements.length).toBe(component.bookCategories.length);

    component.bookCategories.forEach((category, index) => {
      expect(categoryElements[index].textContent.trim()).toBe(category);
    });
  });

  it('should hide content immediately when collapsed', () => {
    component.isContentVisible.set(true);
    fixture.detectChanges();
    expect(component.isContentVisible()).toBe(true);

    fixture.componentRef.setInput('isCollapsed', true);
    fixture.detectChanges();

    expect(component.isContentVisible()).toBe(false);
  });

  it('should submit filters when toggling discounted', () => {
    component.isContentVisible.set(true);
    fixture.detectChanges();

    const discountBtn = fixture.nativeElement.querySelector(
      '[data-testid="discount-btn"]',
    );
    discountBtn.click();
    fixture.detectChanges();

    expect(component.filters().isDiscounted).toBe(true);
    expect(mockAppStore.updateFilters).toHaveBeenCalled();
    expect(mockAppStore.addToHistory).toHaveBeenCalled();
  });

  it('should render search history suggestions', () => {
    mockAppStore.searchHistory.mockReturnValue(['harry potter', 'lotr']);
    component.isContentVisible.set(true);
    component.showHistory.set(true);
    // Force a fresh component render to pick the new history mock
    fixture.componentRef.hostView.detectChanges();

    const history = fixture.nativeElement.querySelectorAll('.filter-history li');
    expect(history.length).toBe(2);
    expect(history[0].textContent).toContain('harry potter');
  });
});