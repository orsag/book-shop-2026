import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductItem } from './product-item';
import { getTranslocoModule } from '@core';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';
import { CartStore, UserStore } from '@store';
import { UXService } from '@service';
import { MOCKED_PRODUCT, BOOK_GRADIENT } from '@store/libs';
import { signal } from '@angular/core';

describe('ProductItem', () => {
  let component: ProductItem;
  let mockCartStore: any;
  let mockUXService: any;
  let mockUserStore: any;
  let fixture: ComponentFixture<ProductItem>;

  beforeEach(async () => {
    mockUXService = {
      isFavorite: vi.fn().mockReturnValue(false),
      author: vi.fn().mockReturnValue('The Prophet'),
      category: vi.fn().mockReturnValue('Fiction'),
      isGradientClass: vi.fn().mockReturnValue(BOOK_GRADIENT),
      isInCart: vi.fn().mockReturnValue(false),
    };
    mockCartStore = {
      addToCart: vi.fn(),
      removeItem: vi.fn(),
    };
    mockUserStore = {
      isLoggedIn: signal(false),
      toggleFavorite: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ProductItem, getTranslocoModule()],
      providers: [
        provideRouter([]),
        { provide: CartStore, useValue: mockCartStore },
        { provide: UXService, useValue: mockUXService },
        { provide: UserStore, useValue: mockUserStore },
      ],
    }).compileComponents();
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
});
