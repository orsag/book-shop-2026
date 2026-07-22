import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Detail } from './detail';
import { ActivatedRoute } from '@angular/router';
import { getTranslocoModule, ErrorService } from '@core';
import { vi } from 'vitest';
import { of, BehaviorSubject } from 'rxjs';
import { BookService, UXService } from '@service';
import { CartStore } from '@store';
import { MOCKED_PRODUCT } from '@store/libs';

describe('Detail', () => {
  const routeParams$ = new BehaviorSubject({ id: '123' });

  let component: Detail;
  let fixture: ComponentFixture<Detail>;
  let mockUXService: any;
  let mockCartStore: any;
  let mockBookService: any;
  let mockErrorService: any;

  beforeEach(async () => {
    mockUXService = {
      author: vi.fn().mockReturnValue('The Prophet'),
      category: vi.fn().mockReturnValue('Fiction'),
      readingHours: vi.fn().mockReturnValue(10),
      isInCart: vi.fn().mockReturnValue(false),
    };

    mockCartStore = {
      addToCart: vi.fn(),
      removeItem: vi.fn(),
    };

    mockBookService = {
      getOne: vi.fn().mockReturnValue(of(MOCKED_PRODUCT)),
    };

    mockErrorService = {
      handleError: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [Detail, getTranslocoModule()],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: routeParams$.asObservable(),
          },
        },
        { provide: CartStore, useValue: mockCartStore },
        { provide: UXService, useValue: mockUXService },
        { provide: BookService, useValue: mockBookService },
        { provide: ErrorService, useValue: mockErrorService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Detail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
