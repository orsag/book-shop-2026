import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import { describe, it, beforeEach, afterEach, expect } from 'vitest';
import { BookService } from './book-service';
import { ProductType, Product, DEFAULT_MAX_LIMIT } from '@store/libs';
import { PaginatedProducts } from '../../types';

describe('BookService', () => {
  const defaultProductType: ProductType = 'BOOK';
  const defaultProductName = 'Pizza italiana happy';
  const defaultProductId = '01b9d23b-0a21-409f-a28a-85f07f2d5b75';
  let service: BookService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        BookService,
        provideHttpClient(),
        provideHttpClientTesting(), // Intercepts and mocks http requests
      ],
    });

    service = TestBed.inject(BookService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Ensures that no unmatched or unexpected HTTP requests are left hanging
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // --- Testing GET with Query Params ---
  describe('fetchProducts', () => {
    it('should fetch products with correctly mapped query parameters', () => {
      const mockFilters = {
        type: defaultProductType,
        search: 'Pizza',
        page: 1,
        limit: DEFAULT_MAX_LIMIT,
      };
      const mockResponse: PaginatedProducts = {
        data: MOCK_FOUND_PRODUCTS,
        meta: {
          total: 1,
          page: 1,
          lastPage: 1,
          count: 1,
        },
      };

      service.fetchProducts(mockFilters).subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      // Expect a GET request to the URL with specific params
      const req = httpMock.expectOne('/api/products?type=BOOK&search=Pizza&page=1&limit=12');
      expect(req.request.method).toBe('GET');

      // Flush the mock data to resolve the Observable
      req.flush(mockResponse);
    });
  });

  // --- Testing GET with Path Params ---
  describe('getOne', () => {
    it('should fetch a single product by ID and type', () => {
      const mockProduct = {
        id: defaultProductId,
        name: defaultProductName,
      } as unknown as Product;

      service
        .getOne(defaultProductId, defaultProductType)
        .subscribe((product) => {
          expect(product).toEqual(mockProduct);
        });

      const req = httpMock.expectOne(
        `/api/products/${defaultProductId}?type=${defaultProductType}`,
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockProduct);
    });
  });

  // --- Testing POST ---
  describe('create', () => {
    it('should send a POST request to create a product', () => {
      const newProduct = { name: 'New Book' };
      const mockResponse = {
        id: '999',
        name: 'New Book',
      } as unknown as Product;

      service.create(newProduct).subscribe((res) => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('/api/products');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newProduct);
      req.flush(mockResponse);
    });
  });

  // --- Testing DELETE ---
  describe('delete', () => {
    it('should send a DELETE request', () => {
      const mockActionResponse = {
        success: true,
        message: 'Produkt bol úspešne odstránený.',
      };

      service.delete(defaultProductId).subscribe((res) => {
        expect(res).toEqual(mockActionResponse);
      });

      const req = httpMock.expectOne(`/api/products/${defaultProductId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(mockActionResponse);
    });
  });
});

const MOCK_FOUND_PRODUCTS: Product[] = [
  {
    id: '01b9d23b-0a21-409f-a28a-85f07f2d5b75',
    sku: '27Z6SGMY',
    name: 'Pizza italiana happy',
    alternativeHeadline: 'Sharable static throughput',
    description:
      "Cruickshank Group's most advanced Car technology increases sunny capabilities",
    price: 197.75,
    discount: 0.1,
    availableCount: 20,
    isAvailable: true,
    product_quality: 'new',
    coverUrl:
      'https://picsum.photos/seed/14eb3c2f-f822-4d73-ac06-186197dee6a0/400/600',
    productType: 'BOOK',
    createdAt: '2026-05-16T10:00:00.992Z',
    updatedAt: '2026-06-26T07:47:14.213Z',
    rating: {
      id: 'f94d9da1-dd11-41ba-b0b7-bb11ce936791',
      ratingValue: 5,
      ratingCount: 248,
      bestRating: 5,
      worstRating: 1,
      productId: '01b9d23b-0a21-409f-a28a-85f07f2d5b75',
    },
    bookDetails: {
      id: 'cd4fe403-fe47-4fd9-8ffc-439f3d0095bb',
      productId: '01b9d23b-0a21-409f-a28a-85f07f2d5b75',
      author: 'The Prophet',
      isbn: '978-0-11-486512-2',
      publisher: 'University of Michigan Press',
      pageCount: 509,
      bookFormat: 'Audiobook',
      category: 'Fantasy',
      binding: 'flexibound',
      publishedDate: new Date('2026-01-30T19:22:36.209Z'),
      audioBook: false,
      audioLength: 227,
      audioLanguage: 'Slovak',
    },
  },
];
