import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Success } from './success';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { OrderService } from '../../services/order-service';

const MOCK_CREATED_ORDER = {
  id: 'd93bckja0a',
  userId: 'd93bckja0a',
  totalAmount: 1,
  status: 'PENDING',
  createdAt: new Date(),
  items: [],
};

describe('Success', () => {
  let component: Success;
  let mockOrderService: any;
  let mockSnapshotRoute: any;
  let fixture: ComponentFixture<Success>;

  beforeEach(async () => {
    mockOrderService = {
      getOrderById: vi.fn().mockReturnValue(of(MOCK_CREATED_ORDER)),
    };

    mockSnapshotRoute = {
      snapshot: {
        paramMap: convertToParamMap({ id: 'd93bckja0a' }),
      },
    };

    await TestBed.configureTestingModule({
      imports: [Success],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: mockSnapshotRoute,
        },
        { provide: OrderService, useValue: mockOrderService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Success);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
