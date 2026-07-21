import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Profile } from './profile';
import { signal } from '@angular/core';
import { vi, describe, beforeEach, it, expect } from 'vitest';
import { AppStore } from '../../store/app-store';
import { OrderService } from '../../services/order-service';
import { ToastService } from '../../services/toast-service';
import { OrderStatus } from '@store/shared-models';
import { of } from 'rxjs';
import { getTranslocoModule } from '@core';
import { provideRouter } from '@angular/router';
import { UserStore } from '../../store/user-store';
import { CartStore } from '../../store/cart-store';

describe('Profile Component (Vitest)', () => {
  let component: Profile;
  let fixture: ComponentFixture<Profile>;
  let mockAppStore: any;
  let mockUserStore: any;
  let mockCartStore: any;
  let mockOrderService: any;
  let mockToastService: any;

  beforeEach(async () => {
    mockUserStore = {
      favoriteCount: signal(1),
      refreshUser: vi.fn(),
      updateUserDetail: vi.fn(),
      loadUserDetail: vi.fn(),
      user: signal({
        id: 'user-123',
        username: 'john_doe',
        email: 'john@example.com',
        phoneNumber: '+421900123456',
        theme: 'light',
      }),
      userDetail: signal({
        displayName: 'John Doe',
        bio: 'Milovník kníh',
        city: 'Bratislava',
        addressLine1: 'Hlavná 1',
        iban: 'SK1234567890',
        taxId: '10203040',
        dateOfBirth: '1990-01-01',
        isPremium: false,
        membershipEnd: null,
      }),
    };
    mockCartStore = {
      orders: signal([
        {
          id: 'ord-001',
          createdAt: new Date(),
          totalAmount: 45.99,
          status: OrderStatus.PENDING,
        },
      ]),
      reloadOrders: vi.fn(),
      updateOrderLocal: vi.fn(),
    };
    mockAppStore = {
      favoriteProducts: signal([{ id: 'book-1', name: 'Zaklínač', price: 15 }]),
    };

    // 2. Nastavenie mockov pre služby
    mockOrderService = {
      cancelOrder: vi.fn().mockReturnValue(of({})),
    };

    mockToastService = {
      success: vi.fn(),
      alert: vi.fn(),
    };

    // Špión pre schránku (clipboard)
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });

    await TestBed.configureTestingModule({
      imports: [Profile, getTranslocoModule()],
      providers: [
        provideRouter([]),
        { provide: UserStore, useValue: mockUserStore },
        { provide: CartStore, useValue: mockCartStore },
        { provide: AppStore, useValue: mockAppStore },
        { provide: OrderService, useValue: mockOrderService },
        { provide: ToastService, useValue: mockToastService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Profile);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should load data of user details', () => {
    expect(component).toBeTruthy();
    expect(mockUserStore.loadUserDetail).toHaveBeenCalledWith({
      userId: 'user-123',
    });
    expect(mockCartStore.reloadOrders).toHaveBeenCalledWith({
      userId: 'user-123',
    });
  });

  // --- SEKCE: ZOZNAMY (OBJEDNÁVKY A OBĽÚBENÉ) ---
  describe('Orders and favorite products', () => {
    it('should display orders table', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const table = compiled.querySelector('table');
      expect(table).toBeTruthy();
      expect(compiled.querySelector('.badge')?.textContent).toContain('1');
    });

    it('shoudl display placeholder if zero orders', () => {
      mockCartStore.orders.set([]);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('table')).toBeFalsy();
      expect(compiled.textContent).toContain(
        'Zatiaľ ste nevytvorili žiadne objednávky.',
      );
    });

    it('should display favorite products section', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const favoriteSection = compiled.querySelector('.badge-secondary');
      expect(favoriteSection?.textContent).toContain('1');
      // Overenie prítomnosti komponentu app-card-small
      expect(compiled.querySelector('app-card-small')).toBeTruthy();
    });

    it('should copy ID after clicking title="copy-id-btn"', async () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const copyBtn = compiled.querySelector(
        'button[title="copy-id-btn"]',
      ) as HTMLButtonElement;

      if (copyBtn) {
        copyBtn.click();
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith('ord-001');
      }
    });

    it('should call handleCancelOrder after clicking title="cancel-order-btn"', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const cancelBtn = compiled.querySelector(
        'button[title="cancel-order-btn"]',
      ) as HTMLButtonElement;

      if (cancelBtn) {
        cancelBtn.click();
        expect(mockCartStore.updateOrderLocal).toHaveBeenCalledWith(
          'ord-001',
          'CANCELLED',
        );
      }
    });
  });

  // --- SEKCE: FORMULÁR A OSOBNÉ ÚDAJE ---
  describe('Osobné údaje a formuláre', () => {
    it('should fill profile form with data', () => {
      expect(component.userModel().username).toBe('john_doe');
      expect(component.userModel().email).toBe('john@example.com');
      expect(component.userDetailModel().displayName).toBe('John Doe');
    });

    it('should call handleSave if form is valid', () => {
      const saveSpy = vi.spyOn(component, 'handleSave');
      const compiled = fixture.nativeElement as HTMLElement;
      const saveBtn = compiled.querySelector(
        'button[title="save-profile-btn"]',
      ) as HTMLButtonElement;

      if (saveBtn) {
        saveBtn.click();
        expect(saveSpy).toHaveBeenCalled();
        expect(mockUserStore.updateUserDetail).toHaveBeenCalled();
      }
    });

    it('should reset changes after clicking title="cancel-profile-btn"', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const cancelBtn = compiled.querySelector(
        'button[title="cancel-profile-btn"]',
      ) as HTMLButtonElement;

      if (cancelBtn) {
        cancelBtn.click();
        expect(mockToastService.success).toHaveBeenCalledWith(
          'Zmeny resetované',
        );
      }
    });
  });
});
