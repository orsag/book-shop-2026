import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Dashboard } from './dashboard';
import { AppStore } from '../../store/app-store';
import { CartStore } from '../../store/cart-store';
import { ConfigurationService } from '../../services/configuration-service';
import { computed, signal } from '@angular/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { By } from '@angular/platform-browser';
import { getTranslocoModule } from '../../core/transloco-testing.module';

describe('Dashboard Component', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;

  // 1. Create mock structures using Angular Signals
  let mockAppStore: any;
  let mockCartStore: any;
  let mockConfigService: any;

  beforeEach(async () => {
    // Reset mocks before each test
    mockAppStore = {
      loadBooks: vi.fn(),
      isLoading: signal(false),
      isEmpty: signal(false),
      viewLayout: signal('grid'),
      products: signal([]),
      hasMorePage: computed(() => true),
    };

    mockCartStore = {
      syncCartWithServer: vi.fn(),
    };

    mockConfigService = {
      getFilterValue: vi.fn().mockReturnValue(false),
    };

    // 2. Configure the testing module
    await TestBed.configureTestingModule({
      imports: [Dashboard, getTranslocoModule()], // Since Dashboard is a standalone component
      providers: [
        { provide: AppStore, useValue: mockAppStore },
        { provide: CartStore, useValue: mockCartStore },
        { provide: ConfigurationService, useValue: mockConfigService },
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

  // it('should trigger store.loadBooks and cart sync on initialization', () => {
  //   fixture.detectChanges(); // Triggers ngOnInit
  //
  //   expect(mockAppStore.loadBooks).toHaveBeenCalled();
  //   // expect(mockCartStore.syncCartWithServer).toHaveBeenCalled();
  // });
  //
  // // --- Template State Tests ---
  //
  // it('should show the loading skeleton when store is loading', () => {
  //   // Arrange: Set store state to loading
  //   mockAppStore.isLoading.set(true);
  //
  //   // Act: Tell Angular to update the HTML
  //   fixture.detectChanges();
  //
  //   // Assert: Look for the skeleton container
  //   const skeletonElement = fixture.debugElement.query(By.css('.skeleton'));
  //   expect(skeletonElement).toBeTruthy();
  // });
  //
  // it('should show "Nothing found" state when store is empty', () => {
  //   // Arrange
  //   mockAppStore.isLoading.set(false);
  //   mockAppStore.isEmpty.set(true);
  //
  //   // Act
  //   fixture.detectChanges();
  //
  //   // Assert
  //   const heading = fixture.debugElement.query(By.css('h3'));
  //   expect(heading.nativeElement.textContent).toContain(
  //     'Nothing found in our shop',
  //   );
  // });
  //
  // it('should render book cards when products are available in grid layout', () => {
  //   // Arrange
  //   mockAppStore.isLoading.set(false);
  //   mockAppStore.isEmpty.set(false);
  //   mockAppStore.viewLayout.set('grid'); // Grid is usually VIEW_LAYOUTS[0]
  //   mockAppStore.products.set([
  //     { id: 1, title: 'Book One' },
  //     { id: 2, title: 'Book Two' },
  //   ]);
  //
  //   // Act
  //   fixture.detectChanges();
  //
  //   // Assert: Check if custom components are generated
  //   const bookCards = fixture.debugElement.queryAll(By.css('app-book-card'));
  //   expect(bookCards.length).toBe(2);
  // });
});
