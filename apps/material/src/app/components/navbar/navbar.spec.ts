import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Navbar } from './navbar';
import { getTranslocoModule } from '@core';
import { provideRouter } from '@angular/router';
import { ConfigurationService, ScrollService } from '@service';
import { vi } from 'vitest';
import { computed, signal } from '@angular/core';
import { CartStore, UserStore } from '@store';
import { provideMockStore } from '@ngrx/store/testing';
import { selectAppFilters } from '@ngrx';
import {
  DEFAULT_MAX_LIMIT,
  DEFAULT_PAGE,
  DEFAULT_SEARCH,
  DEFAULT_TYPE,
} from '@store/libs';
import { ThemePicker } from '../theme-picker/theme-picker';
import { MockComponent } from 'ng-mocks';

describe('Navbar', () => {
  let component: Navbar;
  let mockUserStore: any;
  let mockCartStore: any;
  let mockConfigService: any;
  let mockScrollService: any;
  let fixture: ComponentFixture<Navbar>;

  const defaultFilters = {
    type: DEFAULT_TYPE,
    page: DEFAULT_PAGE,
    limit: DEFAULT_MAX_LIMIT,
    search: DEFAULT_SEARCH,
    category: null,
    sortBy: null,
    isDiscounted: false,
  };

  beforeEach(async () => {
    mockUserStore = {
      isLoggedIn: vi.fn().mockReturnValue(true),
      premiumStatus: signal({ isPremium: true }),
      user: signal({}),
      isAdmin: signal(true),
      logout: vi.fn(),
      login: vi.fn(),
    };

    mockCartStore = {
      clearCart: vi.fn(),
      itemCount: computed(() => 0),
    };

    mockConfigService = {
      theme: signal('light'),
      isDarkTheme: vi.fn().mockReturnValue(false),
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
        provideMockStore({
          selectors: [{ selector: selectAppFilters, value: defaultFilters }],
        }),
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