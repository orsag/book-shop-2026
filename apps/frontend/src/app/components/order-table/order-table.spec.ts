import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrderTable } from './order-table';

describe('OrderTable', () => {
  let component: OrderTable;
  let fixture: ComponentFixture<OrderTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderTable],
    }).compileComponents();

    fixture = TestBed.createComponent(OrderTable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
