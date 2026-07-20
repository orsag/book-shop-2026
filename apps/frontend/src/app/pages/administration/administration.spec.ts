import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Administration } from './administration';
import { getTranslocoModule } from '../../core/transloco-testing.module';
import { computed, signal } from '@angular/core';
import { AppStore } from '../../store/app-store';
import { DEFAULT_MAX_LIMIT, DEFAULT_PAGE, DEFAULT_SEARCH, DEFAULT_TYPE } from '@store/libs';
import { vi } from 'vitest';
import { MockComponent } from 'ng-mocks';
import { OrderTable } from '../../components/order-table/order-table';
import { BookTable } from '../../components/book-table/book-table';

describe('Administration', () => {
  let component: Administration;
  let mockAppStore: any;
  let fixture: ComponentFixture<Administration>;

  beforeEach(async () => {
    mockAppStore = {
      userId: signal({ id: '123456' }),
      isLoading: signal(false),
      isEmpty: signal(false),
      viewLayout: signal('grid'),
      products: signal([]),
      hasMorePage: computed(() => true),
      isLoggedIn: computed(() => false),
      isAdmin: computed(() => false),
      filters: signal({
        type: DEFAULT_TYPE,
        page: DEFAULT_PAGE,
        limit: DEFAULT_MAX_LIMIT,
        search: DEFAULT_SEARCH,
        category: null,
        sortBy: null,
        isDiscounted: false,
      }),
      totalPages: computed(() => 1),
      isBook: computed(() => true),
      isGame: computed(() => false),
      isGastro: computed(() => false),
      setPage: vi.fn(),
      reloadOrders: vi.fn(),
    };

    TestBed.overrideComponent(Administration, {
      remove: { imports: [OrderTable, BookTable] },
      add: { imports: [MockComponent(OrderTable), MockComponent(BookTable)] },
    });

    await TestBed.configureTestingModule({
      imports: [Administration, getTranslocoModule()],
      providers: [{ provide: AppStore, useValue: mockAppStore }],
    }).compileComponents();

    fixture = TestBed.createComponent(Administration);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
