import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ActionResponse, Product as IProduct } from '@store/libs';
import { Observable } from 'rxjs';
import { PaginatedProducts } from '../../types';
import { AppState } from '../store/app-store';

@Injectable({
  providedIn: 'root',
})
export class BookService {
  private http = inject(HttpClient);
  private apiUrl = '/api/products';

  // Pure fetcher used by the Store
  fetchProducts(
    p: Partial<AppState['filters']>,
  ): Observable<PaginatedProducts> {
    let params = new HttpParams();
    Object.entries(p).forEach(([k, v]) => {
      if (v !== null && v !== undefined && v !== '') {
        params = params.set(k, v.toString());
      }
    });
    return this.http.get<PaginatedProducts>(this.apiUrl, { params });
  }

  getOne(id: string): Observable<IProduct> {
    return this.http.get<IProduct>(`${this.apiUrl}/${id}`);
  }

  create(product: Partial<IProduct>): Observable<IProduct> {
    return this.http.post<IProduct>(this.apiUrl, product);
  }

  update(id: string, product: Partial<IProduct>): Observable<IProduct> {
    return this.http.patch<IProduct>(`${this.apiUrl}/${id}`, product);
  }

  delete(id: string): Observable<ActionResponse> {
    return this.http.delete<ActionResponse>(`${this.apiUrl}/${id}`);
  }

  // Fetches multiple books by their IDs for the favorites list
  getFavorites(ids: string[]): Observable<IProduct[]> {
    return this.http.post<IProduct[]>(`${this.apiUrl}/list`, { ids });
  }
}
