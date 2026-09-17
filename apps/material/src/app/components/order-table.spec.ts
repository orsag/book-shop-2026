import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrderTable } from './order-table';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { getTranslocoModule } from '@core';
import { of } from 'rxjs';
import { OrderService, ToastService } from '@service';
import { selectOrders } from '@ngrx';
import { OrderStatus } from '@store/shared-models';

const MOCK_ORDER = {
  id: 'd93bckja0a',
  userId: 'user-1',
  totalAmount: 1,
  status: OrderStatus.PENDING,
  createdAt: new Date(),
  items: [],
};

describe('OrderTable', () => {
  let component: OrderTable;
  let fixture: ComponentFixture<OrderTable>;
  let mockStore: MockStore;
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
      imports: [OrderTable, getTranslocoModule()],
      providers: [
        provideMockStore({}),
        { provide: OrderService, useValue: mockOrderService },
        { provide: ToastService, useValue: mockToastService },
      ],
    }).compileComponents();

    mockStore = TestBed.inject(MockStore);
    mockStore.overrideSelector(selectOrders, [MOCK_ORDER]);
    mockStore.refreshState();

    fixture = TestBed.createComponent(OrderTable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render orders from the NgRx store', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('d93bckja0a');
  });
});