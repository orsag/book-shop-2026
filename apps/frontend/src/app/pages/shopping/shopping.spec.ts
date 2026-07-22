import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Shopping } from './shopping';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { vi, describe, beforeEach, it, expect } from 'vitest';
import { CartStore } from '@store';
import { OrderService } from '@service';
import {
  ErrorService,
  SuccessCodes,
  ErrorCodes,
} from '@core';
import { of, throwError } from 'rxjs';

describe('Shopping Component', () => {
  let component: Shopping;
  let fixture: ComponentFixture<Shopping>;
  let mockCartStore: any;
  let mockOrderService: any;
  let mockErrorService: any;

  beforeEach(async () => {
    // 1. Vytvorenie detailného mocku pre CartStore pomocou Angular Signals
    mockCartStore = {
      items: signal([
        {
          product: {
            id: 'prod-1',
            name: 'Kniha 1',
            price: 10,
            discount: 0.1, // 10% zľava
            availableCount: 5,
          },
          quantity: 2,
        },
      ]),
      totalSavings: signal(2),
      subtotal: signal(18),
      tax: signal(0.9),
      grandTotal: signal(18.9),
      syncCartWithServer: vi.fn(),
      clearCart: vi.fn(),
      updateQuantity: vi.fn(),
      removeItem: vi.fn(),
    };

    // 2. Vytvorenie mockov pre ostatné služby
    mockOrderService = {
      createOrder: vi.fn().mockReturnValue(of({ id: 'order-123' })),
    };

    mockErrorService = {
      handleSuccess: vi.fn(),
      handleError: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [Shopping],
      providers: [
        provideRouter([]),
        { provide: CartStore, useValue: mockCartStore },
        { provide: OrderService, useValue: mockOrderService },
        { provide: ErrorService, useValue: mockErrorService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Shopping);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
    expect(mockCartStore.syncCartWithServer).toHaveBeenCalledOnce();
  });

  it('should show empty cart', () => {
    mockCartStore.items.set([]);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.italic')?.textContent).toContain(
      'Empty cart',
    );
  });

  it('should call clear card when btn clicked"', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const clearBtn = compiled.querySelector(
      'button[title="clear-btn"]',
    ) as HTMLButtonElement;

    clearBtn.click();

    expect(mockCartStore.clearCart).toHaveBeenCalled();
  });

  it('should decrease count of item after "minus" clicked', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const minusBtn = compiled.querySelector(
      'button[title="minus-btn"]',
    ) as HTMLButtonElement;

    minusBtn.click();

    expect(mockCartStore.updateQuantity).toHaveBeenCalledWith('prod-1', -1);
  });

  it('should increase count of item after "plus" clicked', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const plusBtn = compiled.querySelector(
      'button[title="plus-btn"]',
    ) as HTMLButtonElement;

    plusBtn.click();

    expect(mockCartStore.updateQuantity).toHaveBeenCalledWith('prod-1', 1);
  });

  it('should call removeItem after trash clicked', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const removeBtn = compiled.querySelector(
      'button[title="remove-btn"]',
    ) as HTMLButtonElement;

    removeBtn.click();

    expect(mockCartStore.removeItem).toHaveBeenCalledWith('prod-1');
  });

  it('should disable plus btn if item not available', () => {
    // Nastavíme množstvo rovné dostupným zásobám (5)
    mockCartStore.items.set([
      {
        product: {
          id: 'prod-1',
          name: 'Kniha 1',
          price: 10,
          discount: 0,
          availableCount: 5,
        },
        quantity: 5,
      },
    ]);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const plusBtn = compiled.querySelector(
      'button[title="plus-btn"]',
    ) as HTMLButtonElement;

    expect(plusBtn.disabled).toBe(true);
  });

  it('should finalise order and redirect to success', async () => {
    await component.handleCheckout();

    // Overenie transformácie dát pre API
    expect(mockOrderService.createOrder).toHaveBeenCalledWith({
      items: [{ productId: 'prod-1', quantity: 2 }],
    });

    // Overenie úspešných krokov
    expect(mockErrorService.handleSuccess).toHaveBeenCalledWith(
      SuccessCodes.CHECKOUT,
    );
    expect(mockCartStore.clearCart).toHaveBeenCalled();
  });

  it('should handle createOrder error', async () => {
    // Simulácia chyby z API
    mockOrderService.createOrder.mockReturnValue(
      throwError(() => new Error('API Error')),
    );

    await component.handleCheckout();

    expect(mockErrorService.handleError).toHaveBeenCalledWith(
      ErrorCodes.CHECKOUT,
    );
    // Košík by sa v prípade chyby nemal vyčistiť
    expect(mockCartStore.clearCart).not.toHaveBeenCalled();
  });
});
