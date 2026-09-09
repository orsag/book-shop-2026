import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { Dashboard } from './dashboard';
import { AppStore, CartStore, UserStore } from '@store';
import { ConfigurationService, PaginationAccumulatorService } from '@service';
import { computed, signal } from '@angular/core';
import {
  DEFAULT_MAX_LIMIT,
  DEFAULT_PAGE,
  DEFAULT_SEARCH,
  DEFAULT_TYPE,
  MOCKED_PRODUCT,
} from '@store/libs';
import { vi } from 'vitest';
import { MockComponent } from 'ng-mocks';
import { FilterBar } from '../../components/filter-bar/filter-bar';
import { Pagination } from '../../components/pagination/pagination';
import { ProductItem } from '../../components/product-item/product-item';

describe('Dashboard', () => {
  let component: Dashboard;
  let mockAppStore: any;
  let mockCartStore: any;
  let mockUserStore: any;
  let mockConfigService: any;
  let mockAccumulator: any;
  let fixture: ComponentFixture<Dashboard>;

  beforeEach(async () => {
    mockUserStore = {
      isLoggedIn: computed(() => false),
      isAdmin: computed(() => false),
    };

    mockAppStore = {
      productsResource: {} as any,
      filters: signal({
        type: DEFAULT_TYPE,
        page: DEFAULT_PAGE,
        limit: DEFAULT_MAX_LIMIT,
        search: DEFAULT_SEARCH,
        category: null,
        sortBy: null,
        isDiscounted: false,
      }),
      appendMode: signal(false),
      hasMorePage: computed(() => false),
      totalProducts: computed(() => 0),
      setPage: vi.fn(),
      loadMore: vi.fn(),
    };

    mockCartStore = {
      syncCartWithServer: vi.fn(),
    };

    mockConfigService = {
      theme: signal('light'),
      isDarkTheme: vi.fn().mockReturnValue(false),
      getFilterValue: vi.fn().mockReturnValue(false),
    };

    mockAccumulator = {
      accumulate: vi.fn().mockReturnValue(of([])),
    };

    TestBed.overrideComponent(Dashboard, {
      remove: { imports: [FilterBar, Pagination, ProductItem] },
      add: {
        imports: [
          MockComponent(FilterBar),
          MockComponent(Pagination),
          MockComponent(ProductItem),
        ],
      },
    });

    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [
        { provide: AppStore, useValue: mockAppStore },
        { provide: CartStore, useValue: mockCartStore },
        { provide: UserStore, useValue: mockUserStore },
        { provide: ConfigurationService, useValue: mockConfigService },
        { provide: PaginationAccumulatorService, useValue: mockAccumulator },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should sync the cart with the server on init', () => {
    fixture.detectChanges();
    expect(mockCartStore.syncCartWithServer).toHaveBeenCalled();
  });

  it('should show the empty state when there are no products', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    const empty = fixture.nativeElement.querySelector('.dashboard-empty');
    expect(empty).toBeTruthy();
    expect(empty.textContent).toContain('Nothing found in our shop');
  });

  it('should render product items in the list layout', async () => {
    mockAccumulator.accumulate.mockReturnValue(
      of([MOCKED_PRODUCT, MOCKED_PRODUCT]),
    );

    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
    fixture.detectChanges();

    const list = fixture.nativeElement.querySelector(
      '[data-testid="main-layout-list"]',
    );
    expect(list).toBeTruthy();
    expect(list.querySelectorAll('app-product-item').length).toBe(2);
  });

  it('should render pagination and load more when there are more pages', async () => {
    mockAccumulator.accumulate.mockReturnValue(of([MOCKED_PRODUCT]));
    mockAppStore.hasMorePage = computed(() => true);

    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
    fixture.detectChanges();

    const pagination = fixture.nativeElement.querySelector('.dashboard-pagination');
    expect(pagination).toBeTruthy();

    const loadMore = fixture.nativeElement.querySelector(
      '[data-testid="load-more"]',
    ) as HTMLButtonElement;
    loadMore.click();
    fixture.detectChanges();
    expect(mockAppStore.loadMore).toHaveBeenCalled();
  });
});