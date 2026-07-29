import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Navbar } from './navbar';
import { getTranslocoModule } from '@core';
import { provideRouter } from '@angular/router';
import { ConfigurationService, ScrollService } from '@service';
import { vi } from 'vitest';
import { computed, signal } from '@angular/core';
import { AppStore, CartStore, UserStore } from '@store';
import { ProductType } from '@store/libs';
import {
  DEFAULT_MAX_LIMIT,
  DEFAULT_PAGE,
  DEFAULT_SEARCH,
  DEFAULT_TYPE,
} from '@store/libs';
import { ThemePicker } from '@component';
import { MockComponent } from 'ng-mocks';

describe('Navbar', () => {
  let component: Navbar;
  let mockAppStore: any;
  let mockUserStore: any;
  let mockCartStore: any;
  let mockConfigService: any;
  let mockScrollService: any;
  let fixture: ComponentFixture<Navbar>;

  beforeEach(async () => {
    mockUserStore = {
      isLoggedIn: vi.fn().mockReturnValue(true),
      premiumStatus: signal({ isPremium: true }),
      user: signal({}),
      isAdmin: signal(true),
      logout: vi.fn(),
      login: vi.fn(),
    };

    mockAppStore = {
      currentType: computed(() => 'BOOK' as ProductType),
      updateFilters: vi.fn(),
      addToHistory: vi.fn(),
      filters: signal({
        type: DEFAULT_TYPE,
        page: DEFAULT_PAGE,
        limit: DEFAULT_MAX_LIMIT,
        search: DEFAULT_SEARCH,
        category: null,
        sortBy: null,
        isDiscounted: false,
      }),
    };

    mockCartStore = {
      clearCart: vi.fn(),
      itemCount: computed(() => 0),
    };

    mockConfigService = {
      theme: signal('light'),
      getFilterValue: vi.fn().mockReturnValue(false),
      flags: vi.fn().mockReturnValue({
        SHOW_SEARCHBAR_HEADER: false,
      }),
    };

    mockScrollService = {
      scrollToTop: vi.fn(),
    };

    TestBed.overrideComponent(Navbar, {
      remove: { imports: [ThemePicker] },
      add: { imports: [MockComponent(ThemePicker)] },
    });

    await TestBed.configureTestingModule({
      imports: [Navbar, getTranslocoModule()],
      providers: [
        provideRouter([]),
        { provide: AppStore, useValue: mockAppStore },
        { provide: CartStore, useValue: mockCartStore },
        { provide: UserStore, useValue: mockUserStore },
        { provide: ConfigurationService, useValue: mockConfigService },
        { provide: ScrollService, useValue: mockScrollService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Navbar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
