import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Administration } from './administration';
import { getTranslocoModule } from '@core';
import { computed, signal } from '@angular/core';
import { AppStore, UserStore, CartStore } from '@store';
import {
  DEFAULT_MAX_LIMIT,
  DEFAULT_PAGE,
  DEFAULT_SEARCH,
  DEFAULT_TYPE,
} from '@store/libs';
import { vi } from 'vitest';
import { MockComponent } from 'ng-mocks';
import { OrderTable, BookTable } from '@component';

describe('Administration', () => {
  let component: Administration;
  let mockAppStore: any;
  let mockUserStore: any;
  let mockCartStore: any;
  let fixture: ComponentFixture<Administration>;

  beforeEach(async () => {
    mockCartStore = {
      reloadOrders: vi.fn(),
    };
    mockUserStore = {
      isLoggedIn: computed(() => false),
      isAdmin: computed(() => false),
    };
    mockAppStore = {
      userId: signal({ id: '123456' }),
      isLoading: signal(false),
      isEmpty: signal(false),
      viewLayout: signal('grid'),
      products: signal([]),
      hasMorePage: computed(() => true),
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
    };

    TestBed.overrideComponent(Administration, {
      remove: { imports: [OrderTable, BookTable] },
      add: { imports: [MockComponent(OrderTable), MockComponent(BookTable)] },
    });

    await TestBed.configureTestingModule({
      imports: [Administration, getTranslocoModule()],
      providers: [
        { provide: AppStore, useValue: mockAppStore },
        { provide: UserStore, useValue: mockUserStore },
        { provide: CartStore, useValue: mockCartStore },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Administration);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
