import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FilterBar } from './filter-bar';
import { getTranslocoModule } from '@core';
import { signal, computed } from '@angular/core';
import { AppStore } from '../../store/app-store';
import { provideRouter } from '@angular/router';
import { UserStore } from '../../store/user-store';

describe('FilterBar', () => {
  let component: FilterBar;
  let mockAppStore: any;
  let mockUserStore: any;
  let fixture: ComponentFixture<FilterBar>;

  beforeEach(async () => {
    mockUserStore = {
      isLoggedIn: computed(() => true),
      isAdmin: computed(() => true),
    };
    mockAppStore = {
      updateFilters: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [FilterBar, getTranslocoModule()],
      providers: [
        provideRouter([]),
        { provide: AppStore, useValue: mockAppStore },
        { provide: UserStore, useValue: mockUserStore },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FilterBar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show profile and administration buttons when user is logged in and an admin', async () => {
    // 1. Set the store signals to true
    // mockAppStore.isLoggedIn = signal(true);
    // mockAppStore.isAdmin = signal(true);

    // 2. Trigger change detection to update the DOM structure
    fixture.detectChanges();
    await fixture.whenStable();

    // 3. Query the buttons by their routerLink attributes
    const profileBtn = fixture.nativeElement.querySelector(
      'button[routerLink="/profile"]',
    );
    const adminBtn = fixture.nativeElement.querySelector(
      'button[routerLink="/administration"]',
    );

    // 4. Assert that both buttons are rendered and present in the DOM
    expect(profileBtn).toBeTruthy();
    expect(adminBtn).toBeTruthy();
  });
});
