import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Dashboard } from './dashboard';
import { Pagination as PaginationComponent } from '@component';
import { AppStore, CartStore, UserStore } from '@store';
import {
  ConfigurationService,
  UXService,
  PaginationAccumulatorService,
} from '@service';
import { computed, signal } from '@angular/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { By } from '@angular/platform-browser';
import { getTranslocoModule } from '@core';
import { MockComponent } from 'ng-mocks';
import { MOCK_PRODUCTS, BOOK_GRADIENT } from '@store/libs';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { LoadingService } from '@core';

describe('Dashboard Component', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;
  let loadingService: LoadingService;

  // 1. Create mock structures using Angular Signals
  let mockAppStore: any;
  let mockUserStore: any;
  let mockCartStore: any;
  let mockUXService: any;
  let mockConfigService: any;
  let mockPaginationAccumulatorService: any;

  beforeEach(async () => {
    // Reset mocks before each test
    mockAppStore = {
      isEmpty: signal(false),
      viewLayout: signal('grid'),
      products: signal([]),
      hasMorePage: computed(() => true),
    };

    mockUserStore = {
      isLoggedIn: computed(() => false),
      isAdmin: computed(() => false),
    };

    mockCartStore = {
      addToCart: vi.fn(),
      removeItem: vi.fn(),
      syncCartWithServer: vi.fn(),
    };

    mockUXService = {
      isFavorite: vi.fn().mockReturnValue(false),
      author: vi.fn().mockReturnValue('The Prophet'),
      category: vi.fn().mockReturnValue('Fiction'),
      isGradientClass: vi.fn().mockReturnValue(BOOK_GRADIENT),
      isInCart: vi.fn().mockReturnValue(false),
    };

    mockConfigService = {
      getFilterValue: vi.fn().mockReturnValue(false),
      isDarkTheme: vi.fn().mockReturnValue(false),
    };

    mockPaginationAccumulatorService = {
      accumulate: vi.fn().mockReturnValue(of(MOCK_PRODUCTS)),
    };

    TestBed.overrideComponent(Dashboard, {
      remove: { imports: [PaginationComponent] },
      add: { imports: [MockComponent(PaginationComponent)] },
    });

    // 2. Configure the testing module
    await TestBed.configureTestingModule({
      imports: [Dashboard, getTranslocoModule()], // Since Dashboard is a standalone component
      providers: [
        provideRouter([]),
        { provide: AppStore, useValue: mockAppStore },
        { provide: UserStore, useValue: mockUserStore },
        { provide: CartStore, useValue: mockCartStore },
        { provide: UXService, useValue: mockUXService },
        { provide: ConfigurationService, useValue: mockConfigService },
        {
          provide: PaginationAccumulatorService,
          useValue: mockPaginationAccumulatorService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
    loadingService = TestBed.inject(LoadingService);

    (component as any).VIEW_LAYOUTS = ['grid', 'list'];
  });

  // --- Initialization Tests ---

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  //
  // // --- Template State Tests ---
  //
  it('should show the loading skeleton when products are loading', () => {
    // Arrange: simulate a tagged 'products' request in flight
    loadingService.track('products');
    component.accumulatedProducts$ = of([]);
    (component as any).productsCount = signal(0);
    (component as any).isProductsEmpty = computed(() => component.productsCount() === 0);

    fixture.detectChanges();

    // Assert: Look for the skeleton container
    const skeletonElement = fixture.debugElement.query(By.css('.skeleton'));
    expect(skeletonElement).toBeTruthy();
  });

  it('should show "Nothing found" state when store is empty', () => {
    // Arrange
    component.accumulatedProducts$ = of([]);
    (component as any).productsCount = signal(0);
    (component as any).isProductsEmpty = computed(() => component.productsCount() === 0);

    fixture.detectChanges();

    // Assert
    const heading = fixture.debugElement.query(By.css('h3'));
    expect(heading.nativeElement.textContent).toContain(
      'Nothing found in our shop',
    );
  });

  it('should render book cards when products are available in grid layout', () => {
    component.accumulatedProducts$ = of([...MOCK_PRODUCTS]);
    (component as any).productsCount = signal(MOCK_PRODUCTS.length);
    (component as any).isProductsEmpty = computed(() => component.productsCount() === 0);
    mockAppStore.viewLayout.set('grid');

    // Act
    fixture.whenStable();
    fixture.detectChanges();

    const gridElement = fixture.debugElement.query(
      By.css('[data-testid="main-layout-grid"]'),
    );

    expect(gridElement).toBeTruthy();

    const bookCards = gridElement.queryAll(By.css('app-product-item'));
    expect(bookCards.length).toBe(MOCK_PRODUCTS.length);
  });

  it('keeps the append skeleton visible for at least 1 second after loading finishes', async () => {
    // Arrange: loading starts while items are already on screen
    vi.useFakeTimers();
    loadingService.track('products');
    component.accumulatedProducts$ = of([]);
    (component as any).productsCount = signal(0);
    (component as any).isProductsEmpty = computed(() => component.productsCount() === 0);
    fixture.detectChanges();
    await fixture.whenStable();

    const skeletonCount = () =>
      fixture.nativeElement.querySelectorAll('.skeleton').length;
    expect(skeletonCount()).toBeGreaterThan(0);

    // Act: the fetch resolves almost instantly (0ms)
    loadingService.untrack('products');
    component.accumulatedProducts$ = of([...MOCK_PRODUCTS]);
    (component as any).productsCount = signal(MOCK_PRODUCTS.length);
    (component as any).isProductsEmpty = computed(() => component.productsCount() === 0);
    fixture.detectChanges();
    await fixture.whenStable();

    // ...and disappears once the 1s minimum window elapses
    vi.advanceTimersByTime(1000);
    fixture.detectChanges();
    expect(skeletonCount()).toBe(0);

    vi.useRealTimers();
  });
});
