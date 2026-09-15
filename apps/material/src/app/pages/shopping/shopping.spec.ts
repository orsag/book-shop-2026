import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Shopping } from './shopping';
import { OrderService, ToastService, ConfigurationService } from '@service';
import { ErrorService } from '@core';
import { MOCKED_PRODUCT } from '@store/libs';
import { vi } from 'vitest';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import {
  CartActions,
  selectGrandTotal,
  selectItems,
  selectSubtotal,
  selectTax,
  selectTotalSavings,
} from '@ngrx';

const CART_ITEM = {
  product: MOCKED_PRODUCT,
  quantity: 2,
};

describe('Shopping', () => {
  let component: Shopping;
  let mockStore: MockStore;
  let mockOrderService: any;
  let mockErrorService: any;
  let mockToast: any;
  let fixture: ComponentFixture<Shopping>;

  beforeEach(async () => {
    mockOrderService = {
      createOrder: vi.fn().mockReturnValue(of({ id: 'order-1' })),
    };

    mockErrorService = {
      handleSuccess: vi.fn(),
      handleError: vi.fn(),
    };

    mockToast = {
      danger: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [Shopping],
      providers: [
        provideMockStore({
          selectors: [
            { selector: selectItems, value: [CART_ITEM] },
            { selector: selectTotalSavings, value: 0 },
            { selector: selectSubtotal, value: 100 },
            { selector: selectTax, value: 5 },
            { selector: selectGrandTotal, value: 105 },
          ],
        }),
        { provide: OrderService, useValue: mockOrderService },
        { provide: ErrorService, useValue: mockErrorService },
        { provide: ToastService, useValue: mockToast },
        {
          provide: ConfigurationService,
          useValue: { isDarkTheme: vi.fn().mockReturnValue(false) },
        },
        provideRouter([]),
      ],
    }).compileComponents();

    mockStore = TestBed.inject(MockStore);
    fixture = TestBed.createComponent(Shopping);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should dispatch syncCartWithServer on init', () => {
    const dispatchSpy = vi.spyOn(mockStore, 'dispatch');

    fixture = TestBed.createComponent(Shopping);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(dispatchSpy).toHaveBeenCalledWith(
      CartActions.syncCartWithServer(),
    );
  });

  it('should render cart items with routes', () => {
    fixture.detectChanges();

    const name = fixture.nativeElement.querySelector('.shopping-name');
    expect(name.textContent).toContain(MOCKED_PRODUCT.name);
    expect(name.getAttribute('href')).toContain(
      `/product/${MOCKED_PRODUCT.id}`,
    );
  });

  it('should render the empty state when there are no items', async () => {
    mockStore.overrideSelector(selectItems, []);
    mockStore.refreshState();

    fixture = TestBed.createComponent(Shopping);
    component = fixture.componentInstance;
    await fixture.whenStable();
    fixture.detectChanges();

    const empty = fixture.nativeElement.querySelector('.shopping-empty');
    expect(empty).toBeTruthy();
  });

  it('should remove an item and toast a danger message', () => {
    fixture.detectChanges();
    const dispatchSpy = vi.spyOn(mockStore, 'dispatch');

    const removeBtn = fixture.nativeElement.querySelector(
      '[title="remove-btn"]',
    ) as HTMLButtonElement;
    removeBtn.click();
    fixture.detectChanges();

    expect(dispatchSpy).toHaveBeenCalledWith(
      CartActions.removeItem({ productId: MOCKED_PRODUCT.id }),
    );
    expect(mockToast.danger).toHaveBeenCalled();
  });

  it('should update quantity on plus', () => {
    fixture.detectChanges();
    const dispatchSpy = vi.spyOn(mockStore, 'dispatch');

    const plusBtn = fixture.nativeElement.querySelector(
      '[title="plus-btn"]',
    ) as HTMLButtonElement;
    plusBtn.click();
    fixture.detectChanges();

    expect(dispatchSpy).toHaveBeenCalledWith(
      CartActions.updateQuantity({
        productId: MOCKED_PRODUCT.id,
        delta: 1,
      }),
    );
  });

  it('should check out and navigate to success', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    const dispatchSpy = vi.spyOn(mockStore, 'dispatch');

    const checkoutBtn = fixture.nativeElement.querySelector(
      '.shopping-checkout-row button',
    ) as HTMLButtonElement;
    checkoutBtn.click();
    fixture.detectChanges();

    expect(mockOrderService.createOrder).toHaveBeenCalledWith({
      items: [{ productId: MOCKED_PRODUCT.id, quantity: 2 }],
    });
    expect(mockErrorService.handleSuccess).toHaveBeenCalled();
    expect(dispatchSpy).toHaveBeenCalledWith(CartActions.clearCart());
  });

  it('should handle checkout errors', () => {
    mockOrderService.createOrder.mockReturnValue(
      throwError(() => new Error('checkout failed')),
    );

    fixture = TestBed.createComponent(Shopping);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const checkoutBtn = fixture.nativeElement.querySelector(
      '.shopping-checkout-row button',
    ) as HTMLButtonElement;
    checkoutBtn.click();
    fixture.detectChanges();

    expect(mockErrorService.handleError).toHaveBeenCalled();
  });
});