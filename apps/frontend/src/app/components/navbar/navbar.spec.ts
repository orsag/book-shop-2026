import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Navbar } from './navbar';
import { getTranslocoModule } from '../../core/transloco-testing.module';
import { provideRouter } from '@angular/router';
import { ConfigurationService } from '../../services/configuration-service';
import { vi } from 'vitest';
import { computed, signal } from '@angular/core';
import { AppStore } from '../../store/app-store';
import { CartStore } from '../../store/cart-store';
import { ScrollService } from '../../services/scroll-service';
import { ProductType } from '@store/libs';

describe('Navbar', () => {
  let component: Navbar;
  let mockAppStore: any;
  let mockCartStore: any;
  let mockConfigService: any;
  let mockScrollService: any;
  let fixture: ComponentFixture<Navbar>;

  beforeEach(async () => {
    mockAppStore = {
      currentType: computed(() => 'BOOK' as ProductType),
      isLoggedIn: vi.fn().mockReturnValue(true),
      premiumStatus: signal({ isPremium: true }),
      user: signal({}),
      isAdmin: signal(true),
      logout: vi.fn(),
      login: vi.fn(),
      updateFilters: vi.fn(),
      addToHistory: vi.fn(),
    };

    mockCartStore = {
      clearCart: vi.fn(),
      itemCount: computed(() => 0),
    };

    mockConfigService = {
      theme: signal('light'),
      flags: vi.fn().mockReturnValue({
        SHOW_SEARCHBAR_HEADER: false,
      }),
    };

    mockScrollService = {
      scrollToTop: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [Navbar, getTranslocoModule()],
      providers: [
        provideRouter([]),
        { provide: AppStore, useValue: mockAppStore },
        { provide: CartStore, useValue: mockCartStore },
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
