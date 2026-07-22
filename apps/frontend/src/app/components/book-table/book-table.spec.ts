import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BookTable } from './book-table';
import { getTranslocoModule } from '@core';
import { computed, signal } from '@angular/core';
import { Product } from '@store/shared-models';
import { AppStore } from '@store';

describe('BookTable', () => {
  let component: BookTable;
  let mockAppStore: any;
  let fixture: ComponentFixture<BookTable>;

  beforeEach(async () => {
    mockAppStore = {
      products: signal<Product[]>([]),
      isBook: computed(() => true),
      isGame: computed(() => false),
      isGastro: computed(() => false),
    };
    await TestBed.configureTestingModule({
      imports: [BookTable, getTranslocoModule()],
      providers: [{ provide: AppStore, useValue: mockAppStore }],
    }).compileComponents();

    fixture = TestBed.createComponent(BookTable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
