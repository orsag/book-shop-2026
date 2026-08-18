import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BookTable } from '@component';
import { getTranslocoModule } from '@core';
import { computed, signal } from '@angular/core';
import { CreateProductDto } from '@api';
import { AppStore } from '@store';
import { PaginationAccumulatorService } from '@service';
import { vi } from 'vitest';
import { MOCK_PRODUCTS } from '@store/libs';
import { provideRouter } from '@angular/router';

describe('BookTable', () => {
  let component: BookTable;
  let mockAppStore: any;
  let mockPaginationAccumulatorService: any;
  let fixture: ComponentFixture<BookTable>;

  beforeEach(async () => {
    mockPaginationAccumulatorService = {
      accumulate: vi.fn().mockReturnValue(signal(MOCK_PRODUCTS)),
    };

    mockAppStore = {
      products: signal<CreateProductDto[]>([]),
      isBook: computed(() => true),
      isGame: computed(() => false),
      isGastro: computed(() => false),
    };
    await TestBed.configureTestingModule({
      imports: [BookTable, getTranslocoModule()],
      providers: [
        provideRouter([]),
        { provide: AppStore, useValue: mockAppStore },
        {
          provide: PaginationAccumulatorService,
          useValue: mockPaginationAccumulatorService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BookTable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
