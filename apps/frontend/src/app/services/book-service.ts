import { HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ActionResponse } from '@store/libs';
import { CreateProductDto as IProduct } from '@api';
import { CreateProductDtoProductType as ProductType } from '@api';
import { Observable } from 'rxjs';
import { PaginatedProducts } from '../../types';
import { AppState } from '@store';
import { ApiService } from './api.service';
import { withLoadingKey } from '../core/loading.interceptor';

@Injectable({
  providedIn: 'root',
})
export class BookService {
  private api = inject(ApiService);
  private apiUrl = '/api/products';

  // Pure fetcher used by the Store
  fetchProducts(
    p: Partial<AppState['filters']>,
  ): Observable<PaginatedProducts> {
    const cleanParams = Object.fromEntries(
      Object.entries(p).filter(
        ([_, v]) => v !== null && v !== undefined && v !== '',
      ),
    );

    const params = new HttpParams({
      fromObject: cleanParams as Record<string, string>,
    });

    return this.api.get<PaginatedProducts>(this.apiUrl, {
      params,
      context: withLoadingKey('products'),
    });
  }

  getOne(id: string, type: ProductType): Observable<IProduct> {
    return this.api.get<IProduct>(`${this.apiUrl}/${id}`, {
      params: { type },
    });
  }

  create(product: Partial<IProduct>): Observable<IProduct> {
    return this.api.post<IProduct>(this.apiUrl, product);
  }

  update(id: string, product: Partial<IProduct>): Observable<IProduct> {
    return this.api.patch<IProduct>(`${this.apiUrl}/${id}`, product);
  }

  delete(id: string): Observable<ActionResponse> {
    return this.api.delete<ActionResponse>(`${this.apiUrl}/${id}`);
  }

  // Fetches multiple books by their IDs for the favorites list
  getFavorites(ids: string[]): Observable<IProduct[]> {
    return this.api.post<IProduct[]>(
      `${this.apiUrl}/list`,
      { ids },
      {
        context: withLoadingKey('cart-sync'),
      },
    );
  }
}
