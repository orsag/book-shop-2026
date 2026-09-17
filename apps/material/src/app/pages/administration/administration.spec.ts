import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Administration } from './administration';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { provideRouter } from '@angular/router';
import { getTranslocoModule } from '@core';
import { of } from 'rxjs';
import { OrderService, ToastService } from '@service';
import {
  CartActions,
  selectAppFilters,
  selectHasMorePage,
  selectIsAdmin,
  selectIsEmpty,
  selectOrders,
  selectProductType,
  selectTotalPages,
  selectTotalProducts,
  selectUser,
} from '@ngrx';
import { OrderStatus } from '@store/shared-models';

const TEST_USER = {
  id: 'user-admin-1',
  username: 'admin',
  email: 'admin@example.com',
  phoneNumber: '+421900000000',
  theme: 'light',
  isAdmin: true,
};

const TEST_FILTERS = {
  type: 'BOOK' as const,
  page: 1,
  limit: 10,
  search: '',
  category: null,
  sortBy: null,
  isDiscounted: false,
};

const TEST_ORDER = {
  id: 'ord-admin-1',
  userId: 'user-admin-1',
  totalAmount: 10,
  status: OrderStatus.PENDING,
  createdAt: new Date(),
  items: [],
};

describe('Administration', () => {
  let component: Administration;
  let fixture: ComponentFixture<Administration>;
  let mockStore: MockStore;
  let dispatchSpy: any;
  let mockOrderService: any;
  let mockToastService: any;

  beforeEach(async () => {
    mockOrderService = {
      updateStatus: vi.fn().mockReturnValue(of({})),
      deleteOrder: vi.fn().mockReturnValue(of({})),
    };

    mockToastService = {
      success: vi.fn(),
      alert: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [Administration, getTranslocoModule()],
      providers: [
        provideRouter([]),
        provideMockStore({
          selectors: [
            { selector: selectIsAdmin, value: true },
            { selector: selectUser, value: TEST_USER },
            { selector: selectOrders, value: [TEST_ORDER] },
            { selector: selectAppFilters, value: TEST_FILTERS },
            { selector: selectIsEmpty, value: false },
            { selector: selectHasMorePage, value: false },
            { selector: selectTotalPages, value: 1 },
            { selector: selectTotalProducts, value: 1 },
            { selector: selectProductType, value: 'BOOK' },
          ],
        }),
        { provide: OrderService, useValue: mockOrderService },
        { provide: ToastService, useValue: mockToastService },
      ],
    }).compileComponents();

    mockStore = TestBed.inject(MockStore);
    dispatchSpy = vi.spyOn(mockStore, 'dispatch');

    fixture = TestBed.createComponent(Administration);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should reload orders on init when admin', () => {
    expect(dispatchSpy).toHaveBeenCalledWith(
      CartActions.reloadOrders({ userId: 'user-admin-1' }),
    );
  });

  it('should render the orders table', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('ord-admin-1');
  });
});