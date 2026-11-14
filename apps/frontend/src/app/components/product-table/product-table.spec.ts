import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductTable } from '@component';
import { getTranslocoModule } from '@core';
import { computed, signal } from '@angular/core';
import { CreateProductDto } from '@api';
import { AppStore } from '@store';
import { PaginationAccumulatorService } from '@service';
import { vi } from 'vitest';
import { MOCK_PRODUCTS } from '@store/libs';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

describe('ProductTable', () => {
  let component: ProductTable;
  let mockAppStore: any;
  let mockPaginationAccumulatorService: any;
  let fixture: ComponentFixture<ProductTable>;

  beforeEach(async () => {
    mockPaginationAccumulatorService = {
      accumulate: vi.fn().mockReturnValue(of(MOCK_PRODUCTS)),
    };

    mockAppStore = {
      products: signal<CreateProductDto[]>([]),
      isBook: computed(() => true),
      isGame: computed(() => false),
      isGastro: computed(() => false),
    };
    await TestBed.configureTestingModule({
      imports: [ProductTable, getTranslocoModule()],
      providers: [
        provideRouter([]),
        { provide: AppStore, useValue: mockAppStore },
        {
          provide: PaginationAccumulatorService,
          useValue: mockPaginationAccumulatorService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductTable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
