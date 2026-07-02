import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Pagination } from './pagination';
import { AppStore } from '../../store/app-store';
import { computed, signal } from '@angular/core';
import {
  DEFAULT_MAX_LIMIT,
  DEFAULT_PAGE,
  DEFAULT_SEARCH,
  DEFAULT_TYPE,
} from '@store/libs';
import { vi } from 'vitest';

describe('Pagination', () => {
  let component: Pagination;
  let mockAppStore: any;
  let fixture: ComponentFixture<Pagination>;

  beforeEach(async () => {
    mockAppStore = {
      filters: signal({
        type: DEFAULT_TYPE,
        page: DEFAULT_PAGE,
        limit: DEFAULT_MAX_LIMIT,
        search: DEFAULT_SEARCH,
        category: null,
        sortBy: null,
        isDiscounted: false,
      }),
      products: signal([]),
      totalProducts: computed(() => 10),
      loadMore: vi.fn(),
      isLoading: signal(false),
      hasMorePage: computed(() => false),
      totalPages: computed(() => 1),
      setPage: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [Pagination],
      providers: [{ provide: AppStore, useValue: mockAppStore }],
    }).compileComponents();

    fixture = TestBed.createComponent(Pagination);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
