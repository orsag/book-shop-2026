import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Pagination } from './pagination';
import { AppStore } from '../../store/app-store';
import { computed, signal } from '@angular/core';
import {
  DEFAULT_MAX_LIMIT,
  DEFAULT_PAGE,
  DEFAULT_SEARCH,
  DEFAULT_TYPE,
} from '@store/libs';
import { vi } from 'vitest';

describe('Pagination', () => {
  let component: Pagination;
  let mockAppStore: any;
  let fixture: ComponentFixture<Pagination>;

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
      totalProducts: computed(() => 12),
      loadMore: vi.fn(),
      isLoading: signal(false),
      hasMorePage: computed(() => true),
      totalPages: computed(() => 1),
      setPage: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [Pagination],
      providers: [{ provide: AppStore, useValue: mockAppStore }],
    }).compileComponents();

    fixture = TestBed.createComponent(Pagination);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should correctly render pagination elements when there are multiple pages', async () => {
    // 1. Arrange: Update mockAppStore signals to simulate a higher page setup
    mockAppStore.products = signal(Array(24).fill({ id: 1 })); // Mocking 12 loaded products
    mockAppStore.totalProducts = computed(() => 36); // 36 total items
    mockAppStore.totalPages = computed(() => 3); // 3 total pages
    mockAppStore.hasMorePage = computed(() => true); // There are more pages remaining

    // Set the current active page to page 2 (so previous and next buttons are both active)
    mockAppStore.filters.set({
      ...mockAppStore.filters(),
      page: 2,
    });

    // 2. Act: Trigger change detection to re-render the DOM layout
    fixture.detectChanges();
    await fixture.whenStable();

    // 3. Assertions:

    // A. Check if the "Load More Books" button is visible
    const loadMoreBtn = fixture.nativeElement.querySelector(
      '[data-testid="load-more"]',
    );
    expect(loadMoreBtn).toBeTruthy();
    expect(loadMoreBtn.textContent).toContain('Load More Books');

    // B. Verify the Page Indicators (Current Page / Total Pages)
    const pageContainer =
      fixture.nativeElement.querySelector('.items-baseline');
    expect(pageContainer.textContent).toContain('2'); // Current Page
    expect(pageContainer.textContent).toContain('/');
    expect(pageContainer.textContent).toContain('3'); // Total Pages

    // C. Verify the Summary Text Badge at the bottom
    const summaryBadge = fixture.nativeElement.querySelector('.badge');
    expect(summaryBadge.textContent).toContain('Showing 24 of 36 Items');
  });
});
