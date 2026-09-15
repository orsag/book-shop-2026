import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Navbar } from './navbar';
import { getTranslocoModule } from '@core';
import { provideRouter } from '@angular/router';
import { ConfigurationService, ScrollService } from '@service';
import { vi } from 'vitest';
import { signal } from '@angular/core';
import { provideMockStore } from '@ngrx/store/testing';
import {
  selectAppFilters,
  selectIsAdmin,
  selectIsLoggedIn,
  selectItemCount,
  selectPremiumStatus,
  selectUser,
} from '@ngrx';
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
          selectors: [
            { selector: selectAppFilters, value: defaultFilters },
            { selector: selectItemCount, value: 0 },
            { selector: selectIsLoggedIn, value: true },
            { selector: selectIsAdmin, value: true },
            { selector: selectPremiumStatus, value: null },
            { selector: selectUser, value: {} },
          ],
        }),
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