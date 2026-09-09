import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Shopping } from './shopping';
import { CartStore } from '@store';
import { OrderService, ToastService, ConfigurationService } from '@service';
import { ErrorService } from '@core';
import { computed, signal } from '@angular/core';
import { MOCKED_PRODUCT } from '@store/libs';
import { vi } from 'vitest';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

const CART_ITEM = {
  product: MOCKED_PRODUCT,
  quantity: 2,
};

describe('Shopping', () => {
  let component: Shopping;
  let mockCartStore: any;
  let mockOrderService: any;
  let mockErrorService: any;
  let mockToast: any;
  let fixture: ComponentFixture<Shopping>;

  beforeEach(async () => {
    mockCartStore = {
      items: signal([CART_ITEM]),
      totalSavings: computed(() => 0),
      subtotal: computed(() => 100),
      tax: computed(() => 5),
      grandTotal: computed(() => 105),
      syncCartWithServer: vi.fn(),
      clearCart: vi.fn(),
      removeItem: vi.fn(),
      updateQuantity: vi.fn(),
    };

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
        { provide: CartStore, useValue: mockCartStore },
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

    fixture = TestBed.createComponent(Shopping);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should sync the cart with the server on init', () => {
    fixture.detectChanges();
    expect(mockCartStore.syncCartWithServer).toHaveBeenCalled();
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
    mockCartStore.items.set([]);

    fixture = TestBed.createComponent(Shopping);
    component = fixture.componentInstance;
    await fixture.whenStable();
    fixture.detectChanges();

    const empty = fixture.nativeElement.querySelector('.shopping-empty');
    expect(empty).toBeTruthy();
  });

  it('should remove an item and toast a danger message', () => {
    fixture.detectChanges();

    const removeBtn = fixture.nativeElement.querySelector(
      '[title="remove-btn"]',
    ) as HTMLButtonElement;
    removeBtn.click();
    fixture.detectChanges();

    expect(mockCartStore.removeItem).toHaveBeenCalledWith(MOCKED_PRODUCT.id);
    expect(mockToast.danger).toHaveBeenCalled();
  });

  it('should update quantity on plus', () => {
    fixture.detectChanges();

    const plusBtn = fixture.nativeElement.querySelector(
      '[title="plus-btn"]',
    ) as HTMLButtonElement;
    plusBtn.click();
    fixture.detectChanges();

    expect(mockCartStore.updateQuantity).toHaveBeenCalledWith(
      MOCKED_PRODUCT.id,
      1,
    );
  });

  it('should check out and navigate to success', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    const checkoutBtn = fixture.nativeElement.querySelector(
      '.shopping-checkout-row button',
    ) as HTMLButtonElement;
    checkoutBtn.click();
    fixture.detectChanges();

    expect(mockOrderService.createOrder).toHaveBeenCalledWith({
      items: [{ productId: MOCKED_PRODUCT.id, quantity: 2 }],
    });
    expect(mockErrorService.handleSuccess).toHaveBeenCalled();
    expect(mockCartStore.clearCart).toHaveBeenCalled();
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