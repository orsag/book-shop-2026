import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FilterBar } from './filter-bar';
import { getTranslocoModule } from '@core';
import { computed } from '@angular/core';
import { AppStore, UserStore } from '@store';
import { ConfigurationService } from '@service';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { vi } from 'vitest';

describe('FilterBar', () => {
  let component: FilterBar;
  let mockAppStore: any;
  let mockUserStore: any;
  let mockConfigService: any;
  let fixture: ComponentFixture<FilterBar>;

  beforeEach(async () => {
    mockUserStore = {
      isLoggedIn: computed(() => true),
      isAdmin: computed(() => true),
    };
    mockAppStore = {
      updateFilters: vi.fn(),
    };
    mockConfigService = {
      theme: signal('light'),
      isDarkTheme: vi.fn().mockReturnValue(false),
    };

    await TestBed.configureTestingModule({
      imports: [FilterBar, getTranslocoModule()],
      providers: [
        provideRouter([]),
        { provide: AppStore, useValue: mockAppStore },
        { provide: UserStore, useValue: mockUserStore },
        { provide: ConfigurationService, useValue: mockConfigService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FilterBar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update the type filter when a pill is clicked', () => {
    fixture.detectChanges();
    const booksBtn = Array.from(
      fixture.nativeElement.querySelectorAll('button'),
    ).find((b: any) => b.textContent?.includes('Books'));
    (booksBtn as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(mockAppStore.updateFilters).toHaveBeenCalledWith({
      type: 'BOOK',
      search: '',
      category: null,
      isDiscounted: false,
    });
  });

  it('should show profile and administration buttons when user is logged in and an admin', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    const profileBtn = fixture.nativeElement.querySelector(
      '[routerLink="/profile"]',
    );
    const adminBtn = fixture.nativeElement.querySelector(
      '[routerLink="/administration"]',
    );

    expect(profileBtn).toBeTruthy();
    expect(adminBtn).toBeTruthy();
  });
});