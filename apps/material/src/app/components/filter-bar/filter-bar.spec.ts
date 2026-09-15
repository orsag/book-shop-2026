import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FilterBar } from './filter-bar';
import { getTranslocoModule } from '@core';
import { ConfigurationService } from '@service';
import { provideRouter } from '@angular/router';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { AppActions, selectIsAdmin, selectIsLoggedIn } from '@ngrx';
import { signal } from '@angular/core';
import { vi } from 'vitest';

describe('FilterBar', () => {
  let component: FilterBar;
  let mockConfigService: any;
  let mockStore: MockStore;
  let fixture: ComponentFixture<FilterBar>;

  beforeEach(async () => {
    mockConfigService = {
      theme: signal('light'),
      isDarkTheme: vi.fn().mockReturnValue(false),
    };

    await TestBed.configureTestingModule({
      imports: [FilterBar, getTranslocoModule()],
      providers: [
        provideRouter([]),
        provideMockStore({
          selectors: [
            { selector: selectIsLoggedIn, value: true },
            { selector: selectIsAdmin, value: true },
          ],
        }),
        { provide: ConfigurationService, useValue: mockConfigService },
      ],
    }).compileComponents();

    mockStore = TestBed.inject(MockStore);
    fixture = TestBed.createComponent(FilterBar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should dispatch updateFilters when a pill is clicked', () => {
    fixture.detectChanges();
    const dispatchSpy = vi.spyOn(mockStore, 'dispatch');

    const booksBtn = Array.from(
      fixture.nativeElement.querySelectorAll('button'),
    ).find((b: any) => b.textContent?.includes('Books'));
    (booksBtn as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(dispatchSpy).toHaveBeenCalledWith(
      AppActions.updateFilters({
        partial: {
          type: 'BOOK',
          search: '',
          category: null,
          isDiscounted: false,
        },
      }),
    );
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