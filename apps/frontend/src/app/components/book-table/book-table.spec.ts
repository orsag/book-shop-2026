import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BookTable } from '@component';
import { getTranslocoModule } from '@core';
import { computed, signal } from '@angular/core';
import { CreateProductDto } from '@api';
import { AppStore } from '@store';

describe('BookTable', () => {
  let component: BookTable;
  let mockAppStore: any;
  let fixture: ComponentFixture<BookTable>;

  beforeEach(async () => {
    mockAppStore = {
      products: signal<CreateProductDto[]>([]),
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
