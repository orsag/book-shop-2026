import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrderTable } from './order-table';
import { getTranslocoModule } from '../../core/transloco-testing.module';

describe('OrderTable', () => {
  let component: OrderTable;
  let fixture: ComponentFixture<OrderTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderTable, getTranslocoModule()],
    }).compileComponents();

    fixture = TestBed.createComponent(OrderTable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
