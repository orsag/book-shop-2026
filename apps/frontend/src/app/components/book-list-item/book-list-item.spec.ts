import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BookListItem } from './book-list-item';
import { getTranslocoModule } from '@core';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';
import { MOCKED_PRODUCT, BOOK_GRADIENT } from '@store/libs';
import { CartStore } from '../../store/cart-store';
import { UXService } from '../../services/ux-service';

describe('BookListItem', () => {
  let component: BookListItem;
  let mockCartStore: any;
  let mockUXService: any;
  let fixture: ComponentFixture<BookListItem>;

  beforeEach(async () => {
    mockUXService = {
      author: vi.fn().mockReturnValue('The Prophet'),
      category: vi.fn().mockReturnValue('Fiction'),
      isGradientClass: vi.fn().mockReturnValue(BOOK_GRADIENT),
      isInCart: vi.fn().mockReturnValue(false),
    };

    mockCartStore = {
      addToCart: vi.fn(),
      removeItem: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [BookListItem, getTranslocoModule()],
      providers: [
        provideRouter([]),
        { provide: CartStore, useValue: mockCartStore },
        { provide: UXService, useValue: mockUXService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BookListItem);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('product', MOCKED_PRODUCT);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should receive the required product input', () => {
    // Set the required input safely before running initial change detection
    // fixture.componentRef.setInput('product', MOCKED_PRODUCT);

    // fixture.detectChanges(); // Triggers ngOnInit, etc.

    expect(component.product?.id).toEqual(MOCKED_PRODUCT['id']);
  });
});
