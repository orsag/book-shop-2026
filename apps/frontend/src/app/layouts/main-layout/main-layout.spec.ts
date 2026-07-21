import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MainLayoutComponent as MainLayout } from './main-layout';
import { CartStore } from '../../store/cart-store';
import { ConfigurationService } from '../../services/configuration-service';
import { vi } from 'vitest';
import { getTranslocoModule } from '@core';
import { provideRouter } from '@angular/router';
import { computed, signal } from '@angular/core';

describe('MainLayout', () => {
  let component: MainLayout;
  let mockCartStore: any;
  let mockConfigService: any;
  let fixture: ComponentFixture<MainLayout>;

  beforeEach(async () => {
    mockCartStore = {
      itemCount: computed(() => 0),
      syncCartWithServer: vi.fn(),
    };

    mockConfigService = {
      theme: signal('light'),
      flags: vi.fn().mockReturnValue({
        SHOW_FILTER: false,
        SHOW_DISCOUNT_BANNER: false,
      }),
    };

    await TestBed.configureTestingModule({
      imports: [MainLayout, getTranslocoModule()],
      providers: [
        provideRouter([]),
        { provide: CartStore, useValue: mockCartStore },
        { provide: ConfigurationService, useValue: mockConfigService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MainLayout);
    component = fixture.componentInstance;
    (component as any).DEFAULT_LOADER_DELAY = 1000;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
