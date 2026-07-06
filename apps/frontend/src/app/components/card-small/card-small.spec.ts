import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CardSmall } from './card-small';
import { getTranslocoModule } from '../../core/transloco-testing.module';
import { vi } from 'vitest';
import { CartStore } from '../../store/cart-store';
import { UXService } from '../../services/ux-service';
import { AppStore } from '../../store/app-store';
import { provideRouter } from '@angular/router';
import { MOCKED_PRODUCT } from '@store/libs';

describe('BookCard', () => {
  let component: CardSmall;
  let mockAppStore: any;
  let mockUXService: any;
  let mockCartStore: any;

  let fixture: ComponentFixture<CardSmall>;

  beforeEach(async () => {
    mockAppStore = {
      isLoggedIn: vi.fn().mockReturnValue(true),
      toggleFavorite: vi.fn(),
    };

    mockUXService = {
      isFavorite: vi.fn().mockReturnValue(false),
      author: vi.fn().mockReturnValue('The Prophet'),
      category: vi.fn().mockReturnValue('Fiction'),
      readingHours: vi.fn().mockReturnValue(10),
      isInCart: vi.fn().mockReturnValue(false),
    };

    mockCartStore = {
      addToCart: vi.fn(),
      removeItem: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [CardSmall, getTranslocoModule()],
      providers: [
        provideRouter([]),
        { provide: AppStore, useValue: mockAppStore },
        { provide: CartStore, useValue: mockCartStore },
        { provide: UXService, useValue: mockUXService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CardSmall);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('product', MOCKED_PRODUCT);
    fixture.detectChanges(); // Triggers ngOnInit, etc.
    await fixture.whenStable();
  });

  it("should receive the required product input'", () => {
    expect(component).toBeTruthy();
    const mocked_id = component.product?.id;
    expect(mocked_id).toEqual(MOCKED_PRODUCT['id']);
  });
});
