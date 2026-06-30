import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BookCard } from './book-card';
import { getTranslocoModule } from '../../core/transloco-testing.module';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';
import { CartStore } from '../../store/cart-store';
import { UXService } from '../../services/ux-service';
import { BOOK_GRADIENT, MOCKED_PRODUCT } from '../../../mocked';

describe('BookCard', () => {
  let component: BookCard;
  let mockCartStore: any;
  let mockUXService: any;
  let fixture: ComponentFixture<BookCard>;

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

    await TestBed.configureTestingModule({
      imports: [BookCard, getTranslocoModule()],
      providers: [
        provideRouter([]),
        { provide: CartStore, useValue: mockCartStore },
        { provide: UXService, useValue: mockUXService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BookCard);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('product', MOCKED_PRODUCT);
    fixture.detectChanges(); // Triggers ngOnInit, etc.
    await fixture.whenStable();
  });

  it('should receive the required product input', () => {
    // Set the required input safely before running initial change detection
    // fixture.componentRef.setInput('product', MOCKED_PRODUCT);

    // fixture.detectChanges(); // Triggers ngOnInit, etc.

    const mocked_id = component.product?.id;
    expect(mocked_id).toEqual(MOCKED_PRODUCT['id']);
  });
});
