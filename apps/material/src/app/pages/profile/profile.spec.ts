import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Profile } from './profile';
import { vi, describe, beforeEach, it, expect } from 'vitest';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import {
  ConfigurationService,
  OrderService,
  ToastService,
} from '@service';
import { OrderStatus, User, UserDetailSmall } from '@store/shared-models';
import { of } from 'rxjs';
import { provideRouter } from '@angular/router';
import {
  CartActions,
  selectFavoriteCount,
  selectFavoriteProducts,
  selectOrders,
  selectUser,
  selectUserDetail,
  UserActions,
} from '@ngrx';

describe('Profile Component (Material + NgRx)', () => {
  let component: Profile;
  let fixture: ComponentFixture<Profile>;
  let mockStore: MockStore;
  let dispatchSpy: any;
  let mockOrderService: any;
  let mockToastService: any;
  let mockConfigurationService: any;

  const testUser: Partial<User> = {
    id: 'user-123',
    username: 'john_doe',
    email: 'john@example.com',
    phoneNumber: '+421900123456',
    theme: 'light',
  };

  const testDetail: Partial<UserDetailSmall> = {
    displayName: 'John Doe',
    bio: 'Milovník kníh',
    city: 'Bratislava',
    addressLine1: 'Hlavná 1',
    iban: 'SK1234567890',
    taxId: '10203040',
    dateOfBirth: '1990-01-01',
  };

  const testOrder = {
    id: 'ord-001',
    userId: 'user-123',
    createdAt: new Date(),
    totalAmount: 45.99,
    status: OrderStatus.PENDING,
    items: [],
  };

  beforeEach(async () => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });

    mockOrderService = {
      cancelOrder: vi.fn().mockReturnValue(of({})),
    };

    mockToastService = {
      success: vi.fn(),
      alert: vi.fn(),
    };

    mockConfigurationService = {
      isDarkTheme: vi.fn().mockReturnValue(false),
    };

    await TestBed.configureTestingModule({
      imports: [Profile],
      providers: [
        provideRouter([]),
        provideMockStore({
          selectors: [
            { selector: selectUser, value: testUser },
            { selector: selectUserDetail, value: testDetail },
            { selector: selectOrders, value: [testOrder] },
            { selector: selectFavoriteProducts, value: [] },
            { selector: selectFavoriteCount, value: 1 },
          ],
        }),
        { provide: OrderService, useValue: mockOrderService },
        { provide: ToastService, useValue: mockToastService },
        { provide: ConfigurationService, useValue: mockConfigurationService },
      ],
    }).compileComponents();

    mockStore = TestBed.inject(MockStore);
    dispatchSpy = vi.spyOn(mockStore, 'dispatch');

    fixture = TestBed.createComponent(Profile);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should load data and dispatch reloadOrders on init', () => {
    expect(component).toBeTruthy();
    expect(dispatchSpy).toHaveBeenCalledWith(
      CartActions.reloadOrders({ userId: 'user-123' }),
    );
  });

  describe('Orders and favorite products', () => {
    it('should display orders table', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const table = compiled.querySelector('table');
      expect(table).toBeTruthy();
      expect(compiled.querySelector('.profile-count')?.textContent).toContain(
        '1',
      );
      expect(compiled.textContent).toContain('ord-001');
    });

    it('should display placeholder if zero orders', () => {
      mockStore.overrideSelector(selectOrders, []);
      mockStore.refreshState();
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('table')).toBeFalsy();
      expect(compiled.textContent).toContain(
        'Zatiaľ ste nevytvorili žiadne objednávky.',
      );
    });

    it('should display favorite products section', () => {
      const book = {
        id: 'book-1',
        sku: 'SKU-BOOK-001',
        name: 'Zaklínač',
        alternativeHeadline: 'Zaklínač',
        description: 'Prvá časť ságy o zaklínačovi Geraltovi.',
        price: 15,
        discount: 0,
        availableCount: 1,
        isAvailable: true,
        product_quality: 'new',
        productType: 'BOOK' as const,
        coverUrl: 'images/placeholder.webp',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      };
      mockStore.overrideSelector(selectFavoriteProducts, [book]);
      mockStore.overrideSelector(selectFavoriteCount, 1);
      mockStore.refreshState();
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const link = compiled.querySelector('.favorite-card') as HTMLAnchorElement;
      expect(link).toBeTruthy();
      expect(link.getAttribute('href')).toContain('/product/book-1');
      expect(compiled.textContent).toContain('Zaklínač');
    });

    it('should copy ID after clicking title="copy-id-btn"', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const copyBtn = compiled.querySelector(
        'button[title="copy-id-btn"]',
      ) as HTMLButtonElement;

      copyBtn.click();
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('ord-001');
    });

    it('should call handleCancelOrder after clicking title="cancel-order-btn"', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const cancelBtn = compiled.querySelector(
        'button[title="cancel-order-btn"]',
      ) as HTMLButtonElement;

      cancelBtn.click();
      expect(dispatchSpy).toHaveBeenCalledWith(
        CartActions.updateOrderLocal({
          id: 'ord-001',
          status: 'CANCELLED' as OrderStatus,
        }),
      );
      expect(mockOrderService.cancelOrder).toHaveBeenCalledWith('ord-001');
    });
  });

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

      saveBtn.click();
      expect(saveSpy).toHaveBeenCalled();
      expect(dispatchSpy).toHaveBeenCalledWith(
        UserActions.updateUserDetail({
          userId: 'user-123',
          updates: component.userDetailModel(),
        }),
      );
    });

    it('should reset changes after clicking title="cancel-profile-btn"', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const cancelBtn = compiled.querySelector(
        'button[title="cancel-profile-btn"]',
      ) as HTMLButtonElement;

      cancelBtn.click();
      expect(mockToastService.success).toHaveBeenCalledWith('Zmeny resetované');
    });
  });
});