import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FilterBar } from './filter-bar';
import { getTranslocoModule } from '../../core/transloco-testing.module';
import { signal, computed } from '@angular/core';
import { AppStore } from '../../store/app-store';
import { provideRouter } from '@angular/router';

describe('FilterBar', () => {
  let component: FilterBar;
  let mockAppStore: any;
  let fixture: ComponentFixture<FilterBar>;

  beforeEach(async () => {
    mockAppStore = {
      isLoggedIn: computed(() => true),
      isAdmin: computed(() => true),
      updateFilters: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [FilterBar, getTranslocoModule()],
      providers: [
        provideRouter([]),
        { provide: AppStore, useValue: mockAppStore },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FilterBar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
