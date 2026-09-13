import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Pagination } from './pagination';
import { ConfigurationService } from '@service';
import { signal } from '@angular/core';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import {
  selectAppFilters,
  selectHasMorePage,
  selectTotalPages,
  selectTotalProducts,
} from '@ngrx';
import {
  DEFAULT_MAX_LIMIT,
  DEFAULT_PAGE,
  DEFAULT_SEARCH,
  DEFAULT_TYPE,
} from '@store/libs';
import { vi } from 'vitest';

describe('Pagination', () => {
  let component: Pagination;
  let mockConfigService: any;
  let mockStore: MockStore;
  let fixture: ComponentFixture<Pagination>;

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
      theme: signal('light'),
      isDarkTheme: vi.fn().mockReturnValue(false),
    };

    await TestBed.configureTestingModule({
      imports: [Pagination],
      providers: [
        provideMockStore({
          selectors: [
            { selector: selectAppFilters, value: defaultFilters },
            { selector: selectTotalProducts, value: 12 },
            { selector: selectTotalPages, value: 1 },
            { selector: selectHasMorePage, value: true },
          ],
        }),
        { provide: ConfigurationService, useValue: mockConfigService },
      ],
    }).compileComponents();

    mockStore = TestBed.inject(MockStore);
    fixture = TestBed.createComponent(Pagination);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should correctly render pagination elements when there are multiple pages', async () => {
    // 1. Arrange: Override selectors to simulate a higher page setup
    mockStore.overrideSelector(selectAppFilters, {
      ...defaultFilters,
      page: 2,
    });
    mockStore.overrideSelector(selectTotalPages, 3);
    mockStore.overrideSelector(selectTotalProducts, 36);
    mockStore.overrideSelector(selectHasMorePage, true);
    mockStore.refreshState();

    // Simulate 24 items accumulated on screen (infinite scroll / Load More)
    fixture.componentRef.setInput('loadedCount', 24);

    // 2. Act: Trigger change detection to re-render the DOM layout
    fixture.detectChanges();
    await fixture.whenStable();

    // 3. Assertions:

    // A. Verify the Page Indicators (Current Page / Total Pages)
    const pageContainer = fixture.nativeElement.querySelector(
      '.pagination-current',
    );
    expect(pageContainer.textContent).toContain('2'); // Current Page
    expect(pageContainer.textContent).toContain('/');
    expect(pageContainer.textContent).toContain('3'); // Total Pages

    // B. Verify the Summary Text Badge at the bottom
    const summaryBadge = fixture.nativeElement.querySelector(
      '.pagination-summary',
    );
    expect(summaryBadge.textContent).toContain('Showing 24 of 36 Items');
  });
});