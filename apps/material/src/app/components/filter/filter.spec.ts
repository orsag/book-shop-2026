import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Filter } from './filter';
import { getTranslocoModule } from '@core';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { ConfigurationService, ScrollService } from '@service';
import {
  DEFAULT_MAX_LIMIT,
  DEFAULT_PAGE,
  DEFAULT_SEARCH,
  DEFAULT_TYPE,
} from '@store/libs';
import { signal } from '@angular/core';
import {
  AppActions,
  selectAppFilters,
  selectIsBook,
  selectIsMobile,
  selectProducts,
  selectSearchHistory,
  selectTotalProducts,
  selectViewLayout,
} from '@ngrx';

describe('Filter', () => {
  let component: Filter;
  let mockConfigService: any;
  let mockScrollService: any;
  let mockStore: MockStore;
  let fixture: ComponentFixture<Filter>;

  const defaultFilters = {
    type: DEFAULT_TYPE,
    page: DEFAULT_PAGE,
    limit: DEFAULT_MAX_LIMIT,
    search: DEFAULT_SEARCH,
    category: null,
    sortBy: null,
    isDiscounted: false,
  };

  beforeEach(async () => {
    mockConfigService = {
      toggleFlag: vi.fn(),
      isDarkTheme: vi.fn().mockReturnValue(false),
      flags: vi.fn().mockReturnValue({ SHOW_FILTER: true }),
    };

    mockScrollService = {
      scrollToTop: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [Filter, getTranslocoModule()],
      providers: [
        provideRouter([]),
        provideMockStore({
          selectors: [
            { selector: selectAppFilters, value: defaultFilters },
            { selector: selectIsMobile, value: false },
            { selector: selectIsBook, value: true },
            { selector: selectViewLayout, value: 'list' },
            { selector: selectSearchHistory, value: [] },
            { selector: selectProducts, value: [] },
            { selector: selectTotalProducts, value: 10 },
          ],
        }),
        { provide: ConfigurationService, useValue: mockConfigService },
        { provide: ScrollService, useValue: mockScrollService },
      ],
    }).compileComponents();

    mockStore = TestBed.inject(MockStore);
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

  it('should reflect the SHOW_FILTER flag and hide content when collapsed', () => {
    expect(component.showFilter()).toBe(true);
    expect(component.isContentVisible()).toBe(false);
  });

  it('should dispatch updateFilters and addToHistory when toggling discounted', () => {
    component.isContentVisible.set(true);
    fixture.detectChanges();
    const dispatchSpy = vi.spyOn(mockStore, 'dispatch');

    const discountBtn = fixture.nativeElement.querySelector(
      '[data-testid="discount-btn"]',
    );
    discountBtn.click();
    fixture.detectChanges();

    expect(component.filters().isDiscounted).toBe(true);
    expect(dispatchSpy).toHaveBeenCalledWith(
      AppActions.updateFilters({
        partial: expect.objectContaining({ isDiscounted: true }),
      }),
    );
    expect(dispatchSpy).toHaveBeenCalledWith(
      AppActions.addToHistory({ searchTerm: '' }),
    );
  });

  it('should render search history suggestions', async () => {
    mockStore.overrideSelector(selectSearchHistory, ['harry potter', 'lotr']);
    mockStore.refreshState();
    component.isContentVisible.set(true);
    component.showHistory.set(true);
    await fixture.whenStable();
    fixture.detectChanges();

    const history = fixture.nativeElement.querySelectorAll('.filter-history li');
    expect(history.length).toBe(2);
    expect(history[0].textContent).toContain('harry potter');
  });
});