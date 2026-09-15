import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductItem } from './product-item';
import { getTranslocoModule } from '@core';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';
import { UserStore } from '@store';
import { UXService } from '../../services/ux-service';
import { ConfigurationService } from '@service';
import { MOCKED_PRODUCT } from '@store/libs';
import { signal } from '@angular/core';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { CartActions } from '@ngrx';

describe('ProductItem', () => {
  let component: ProductItem;
  let mockStore: MockStore;
  let mockUXService: any;
  let mockUserStore: any;
  let mockConfigService: any;
  let fixture: ComponentFixture<ProductItem>;

  beforeEach(async () => {
    mockUXService = {
      isFavorite: vi.fn().mockReturnValue(false),
      author: vi.fn().mockReturnValue('The Prophet'),
      category: vi.fn().mockReturnValue('Fantasy'),
      isGradientClass: vi.fn(),
      isInCart: vi.fn().mockReturnValue(false),
    };
    mockUserStore = {
      isLoggedIn: signal(false),
      toggleFavorite: vi.fn(),
    };
    mockConfigService = {
      theme: signal('light'),
      isDarkTheme: vi.fn().mockReturnValue(false),
    };

    await TestBed.configureTestingModule({
      imports: [ProductItem, getTranslocoModule()],
      providers: [
        provideRouter([]),
        provideMockStore(),
        { provide: UXService, useValue: mockUXService },
        { provide: UserStore, useValue: mockUserStore },
        { provide: ConfigurationService, useValue: mockConfigService },
      ],
    }).compileComponents();
    mockStore = TestBed.inject(MockStore);
    fixture = TestBed.createComponent(ProductItem);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('product', MOCKED_PRODUCT);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should receive the required product input', () => {
    expect(component.product?.id).toEqual(MOCKED_PRODUCT['id']);
  });

  it('should not toggle favorite when user is not logged in', () => {
    component.toggleFavorite('book-1');
    expect(mockUserStore.toggleFavorite).not.toHaveBeenCalled();
  });

  it('should add the product to the cart', () => {
    const dispatchSpy = vi.spyOn(mockStore, 'dispatch');
    const button = fixture.nativeElement.querySelector(
      'button[data-testid="add-to-cart"]',
    ) as HTMLButtonElement;
    button.click();
    fixture.detectChanges();
    expect(dispatchSpy).toHaveBeenCalledWith(
      CartActions.addToCart({ product: MOCKED_PRODUCT }),
    );
  });

  it('should render the product name while hovering toggling the hover state', () => {
    expect(fixture.nativeElement.textContent).toContain(
      MOCKED_PRODUCT['name'],
    );
    const cover = fixture.nativeElement.querySelector(
      '.product-cover',
    ) as HTMLElement;
    cover.dispatchEvent(new MouseEvent('mouseenter'));
    fixture.detectChanges();
    expect(component.isHovered()).toBe(true);
  });
});