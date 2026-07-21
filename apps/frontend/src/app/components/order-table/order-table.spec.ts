import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrderTable } from './order-table';
import { getTranslocoModule } from '@core';
import { signal } from '@angular/core';
import { AppStore } from '../../store/app-store';
import { OrderService } from '../../services/order-service';
import { of } from 'rxjs';
import { ToastService } from '../../services/toast-service';

const MOCK_CREATED_ORDER = {
  id: 'd93bckja0a',
  userId: 'd93bckja0a',
  totalAmount: 1,
  status: 'PENDING',
  createdAt: new Date(),
  items: [],
};

const MOCK_ORDER = {
  id: 'd93bckja0a',
  userId: 'd93bckja0a',
  totalAmount: 1,
  status: 'REMOVED',
  items: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('OrderTable', () => {
  let component: OrderTable;
  let mockAppStore: any;
  let mockOrderService: any;
  let mockToastService: any;
  let fixture: ComponentFixture<OrderTable>;

  beforeEach(async () => {
    mockAppStore = {
      orders: signal([]),
      isLoggedIn: vi.fn().mockReturnValue(true),
      removeOrderLocal: vi.fn().mockReturnValue(of(MOCK_CREATED_ORDER)),
      updateOrderLocal: vi.fn().mockReturnValue(of(MOCK_ORDER)),
    };

    mockOrderService = {
      updateStatus: vi.fn().mockReturnValue(of(MOCK_CREATED_ORDER)),
      deleteOrder: vi.fn(),
    };

    mockToastService = {
      success: vi.fn(),
      alert: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [OrderTable, getTranslocoModule()],
      providers: [
        { provide: ToastService, useValue: mockToastService },
        { provide: AppStore, useValue: mockAppStore },
        { provide: OrderService, useValue: mockOrderService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OrderTable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
