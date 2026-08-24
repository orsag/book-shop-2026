import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MainLayoutComponent as MainLayout } from './main-layout';
import { AppStore } from '@store';
import { ConfigurationService } from '@service';
import { vi } from 'vitest';
import { getTranslocoModule } from '@core';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import {
  BannerComponent,
  Navbar,
  Filter,
  ProgressComponent,
} from '@component';
import { MockComponent } from 'ng-mocks';

describe('MainLayout', () => {
  let component: MainLayout;
  let mockAppStore: any;
  let mockConfigService: any;
  let fixture: ComponentFixture<MainLayout>;

  beforeEach(async () => {
    mockAppStore = {
      isMobile: signal(false),
      token: signal('mockToken'),
    };

    mockConfigService = {
      theme: signal('light'),
      isDarkTheme: vi.fn().mockReturnValue(false),
      flags: vi.fn().mockReturnValue({
        SHOW_FILTER: false,
        SHOW_DISCOUNT_BANNER: false,
      }),
    };

    TestBed.overrideComponent(MainLayout, {
      remove: { imports: [Navbar, BannerComponent, ProgressComponent, Filter] },
      add: {
        imports: [
          MockComponent(Navbar),
          MockComponent(BannerComponent),
          MockComponent(ProgressComponent),
          MockComponent(Filter),
        ],
      },
    });

    await TestBed.configureTestingModule({
      imports: [MainLayout, getTranslocoModule()],
      providers: [
        provideRouter([]),
        { provide: AppStore, useValue: mockAppStore },
        { provide: ConfigurationService, useValue: mockConfigService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MainLayout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
