import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Dashboard } from './dashboard';
import { Pagination as PaginationComponent } from '../../components/pagination/pagination';
import { AppStore } from '../../store/app-store';
import { CartStore } from '../../store/cart-store';
import { ConfigurationService } from '../../services/configuration-service';
import { computed, signal } from '@angular/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { By } from '@angular/platform-browser';
import { getTranslocoModule } from '../../core/transloco-testing.module';
import { MockComponent } from 'ng-mocks';
import { DEFAULT_MAX_LIMIT, MOCK_PRODUCTS, BOOK_GRADIENT } from '@store/libs';
import { provideRouter } from '@angular/router';
import { UXService } from '../../services/ux-service';
import { PaginationAccumulatorService } from '../../services/pagination-accumulator-service';
import { UserStore } from '../../store/user-store';

describe('Dashboard Component', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;

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
      isLoading: signal(false),
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
    };

    mockPaginationAccumulatorService = {
      accumulate: vi.fn().mockReturnValue(signal(MOCK_PRODUCTS)),
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

    (component as any).VIEW_LAYOUTS = ['grid', 'list'];
  });

  // --- Initialization Tests ---

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  //
  // // --- Template State Tests ---
  //
  it('should show the loading skeleton when store is loading', () => {
    // Arrange: Set store state to loading
    mockAppStore.isLoading.set(true);

    // Act: Tell Angular to update the HTML
    fixture.detectChanges();

    // Assert: Look for the skeleton container
    const skeletonElement = fixture.debugElement.query(By.css('.skeleton'));
    expect(skeletonElement).toBeTruthy();
  });

  it('should show "Nothing found" state when store is empty', () => {
    // Arrange
    mockAppStore.isLoading.set(false);
    mockAppStore.isEmpty.set(true);

    // Act
    fixture.detectChanges();

    // Assert
    const heading = fixture.debugElement.query(By.css('h3'));
    expect(heading.nativeElement.textContent).toContain(
      'Nothing found in our shop',
    );
  });

  it('should render book cards when products are available in grid layout', () => {
    mockAppStore.isLoading.set(false);
    mockAppStore.isEmpty.set(false);
    mockAppStore.viewLayout.set('grid');

    // Act
    fixture.whenStable();
    fixture.detectChanges();

    const gridElement = fixture.debugElement.query(
      By.css('[data-testid="main-layout-grid"]'),
    );

    expect(gridElement).toBeTruthy();

    const bookCards = gridElement.queryAll(By.css('app-book-card'));
    expect(bookCards.length).toBe(DEFAULT_MAX_LIMIT);
  });
});
