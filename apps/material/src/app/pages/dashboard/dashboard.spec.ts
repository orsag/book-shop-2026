import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { Dashboard } from './dashboard';
import { ConfigurationService, PaginationAccumulatorService } from '@service';
import { signal } from '@angular/core';
import {
  DEFAULT_MAX_LIMIT,
  DEFAULT_PAGE,
  DEFAULT_SEARCH,
  DEFAULT_TYPE,
  MOCKED_PRODUCT,
} from '@store/libs';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import {
  AppActions,
  CartActions,
  selectAppendMode,
  selectAppFilters,
  selectHasMorePage,
  selectProductsLoading,
} from '@ngrx';
import { vi } from 'vitest';
import { MockComponent } from 'ng-mocks';
import { FilterBar } from '../../components/filter-bar/filter-bar';
import { Pagination } from '../../components/pagination/pagination';
import { ProductItem } from '../../components/product-item/product-item';

describe('Dashboard', () => {
  let component: Dashboard;
  let mockConfigService: any;
  let mockAccumulator: any;
  let mockStore: MockStore;
  let fixture: ComponentFixture<Dashboard>;

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
      getFilterValue: vi.fn().mockReturnValue(false),
    };

    mockAccumulator = {
      accumulateFrom: vi.fn().mockReturnValue(of([])),
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
        provideMockStore({
          selectors: [
            { selector: selectAppFilters, value: defaultFilters },
            { selector: selectAppendMode, value: false },
            { selector: selectProductsLoading, value: false },
            { selector: selectHasMorePage, value: false },
          ],
        }),
        { provide: ConfigurationService, useValue: mockConfigService },
        { provide: PaginationAccumulatorService, useValue: mockAccumulator },
      ],
    }).compileComponents();

    mockStore = TestBed.inject(MockStore);
    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should dispatch syncCartWithServer on init', () => {
    const dispatchSpy = vi.spyOn(mockStore, 'dispatch');

    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(dispatchSpy).toHaveBeenCalledWith(
      CartActions.syncCartWithServer(),
    );
  });

  it('should show the empty state when there are no products', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    const empty = fixture.nativeElement.querySelector('.dashboard-empty');
    expect(empty).toBeTruthy();
    expect(empty.textContent).toContain('Nothing found in our shop');
  });

  it('should render product items in the list layout', async () => {
    mockAccumulator.accumulateFrom.mockReturnValue(
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

  it('should render pagination and dispatch load more when there are more pages', async () => {
    mockAccumulator.accumulateFrom.mockReturnValue(of([MOCKED_PRODUCT]));
    mockStore.overrideSelector(selectHasMorePage, true);
    mockStore.refreshState();

    const dispatchSpy = vi.spyOn(mockStore, 'dispatch');

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
    expect(dispatchSpy).toHaveBeenCalledWith(AppActions.loadMore());
  });
});