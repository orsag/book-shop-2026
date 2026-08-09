import { TestBed } from '@angular/core/testing';

import { OrderService } from './order-service';
import { ApiService } from './api.service';
import { vi } from 'vitest';

describe('OrderService', () => {
  let service: OrderService;
  const mockApiService = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: ApiService, useValue: mockApiService }],
    });
    service = TestBed.inject(OrderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
