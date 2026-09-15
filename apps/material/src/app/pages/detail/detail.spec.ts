import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { Detail } from './detail';
import { ActivatedRoute } from '@angular/router';
import { BookService, ConfigurationService } from '@service';
import { UXService } from '../../services/ux-service';
import { ErrorService } from '@core';
import { DEFAULT_TYPE, MOCKED_PRODUCT } from '@store/libs';
import { vi } from 'vitest';
import { getTranslocoModule } from '@core';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { AppStateRoot, CartActions, CartStateRoot, selectProductType } from '@ngrx';

describe('Detail', () => {
  let component: Detail;
  let mockStore: MockStore;
  let mockBookService: any;
  let mockUXService: any;
  let fixture: ComponentFixture<Detail>;

  beforeEach(async () => {
    mockBookService = {
      getOne: vi.fn().mockReturnValue(of(MOCKED_PRODUCT)),
    };

    mockUXService = {
      isInCart: vi.fn().mockReturnValue(false),
      category: vi.fn().mockReturnValue(MOCKED_PRODUCT.bookDetails?.category ?? ''),
      author: vi.fn().mockReturnValue(MOCKED_PRODUCT.bookDetails?.author ?? ''),
      readingHours: vi.fn().mockReturnValue(4),
    };

    await TestBed.configureTestingModule({
      imports: [Detail, getTranslocoModule()],
      providers: [
        { provide: ActivatedRoute, useValue: { params: of({ id: '1' }) } },
        provideMockStore({
          selectors: [{ selector: selectProductType, value: DEFAULT_TYPE }],
        }),
        { provide: BookService, useValue: mockBookService },
        { provide: UXService, useValue: mockUXService },
        { provide: ConfigurationService, useValue: { isDarkTheme: vi.fn().mockReturnValue(false) } },
        { provide: ErrorService, useValue: { handleError: vi.fn() } },
      ],
    }).compileComponents();

    mockStore = TestBed.inject(MockStore);
    fixture = TestBed.createComponent(Detail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render product details', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    const title = fixture.nativeElement.querySelector('.detail-title');
    expect(title.textContent).toContain(MOCKED_PRODUCT.name);

    const badge = fixture.nativeElement.querySelector('.detail-badge');
    expect(badge).toBeTruthy();

    const details = fixture.nativeElement.querySelectorAll('.detail-card');
    expect(details.length).toBe(6);
  });

  it('should show the not found state when the book fails to resolve', async () => {
    mockBookService.getOne.mockReturnValue(of(null));

    fixture = TestBed.createComponent(Detail);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();

    const empty = fixture.nativeElement.querySelector('.detail-empty');
    expect(empty).toBeTruthy();
    expect(empty.textContent).toContain('Not found products');
  });

  it('should add the book to the cart when it is not in the cart', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    const dispatchSpy = vi.spyOn(mockStore, 'dispatch');
    const button = fixture.nativeElement.querySelector(
      'button[mat-flat-button]',
    ) as HTMLButtonElement;

    button.click();
    fixture.detectChanges();

    expect(dispatchSpy).toHaveBeenCalledWith(
      CartActions.addToCart({ product: MOCKED_PRODUCT }),
    );
    expect(dispatchSpy).not.toHaveBeenCalledWith(
      CartActions.removeItem({ productId: MOCKED_PRODUCT.id }),
    );
  });

  it('should remove the book from the cart when it is already in the cart', async () => {
    mockUXService.isInCart.mockReturnValue(true);
    fixture.detectChanges();
    await fixture.whenStable();
    const dispatchSpy = vi.spyOn(mockStore, 'dispatch');
    const button = fixture.nativeElement.querySelector(
      '.detail-buttons button[mat-flat-button]',
    ) as HTMLButtonElement;

    button.click();
    fixture.detectChanges();

    expect(dispatchSpy).toHaveBeenCalledWith(
      CartActions.removeItem({ productId: MOCKED_PRODUCT.id }),
    );
    expect(dispatchSpy).not.toHaveBeenCalledWith(
      CartActions.addToCart({ product: MOCKED_PRODUCT }),
    );
  });
});