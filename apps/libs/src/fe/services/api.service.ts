// src/services/api.service.ts
import { Injectable, inject } from '@angular/core';
import {
  HttpClient,
  HttpContext,
  HttpHeaders,
  HttpParams,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '@store/libs';

export interface HttpOptions {
  headers?: HttpHeaders | { [header: string]: string | string[] };
  context?: HttpContext;
  observe?: 'body';
  params?:
    | HttpParams
    | {
        [param: string]:
          | string
          | number
          | boolean
          | readonly (string | number | boolean)[];
      };
  reportProgress?: boolean;
  responseType?: 'json';
  withCredentials?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly http = inject(HttpClient);

  /**
   * Generic GET request that automatically unwraps the backend ApiResponse envelope.
   */
  get<T>(url: string, options?: HttpOptions): Observable<T> {
    return this.http.get<ApiResponse<T>>(url, options as any).pipe(
      map((response) => (response as unknown as ApiResponse<T>).data as T), // Automatically extracts .data
    );
  }

  // You can replicate POST, PUT, PATCH, DELETE similarly if needed:
  post<T>(url: string, body: any, options?: HttpOptions): Observable<T> {
    return this.http
      .post<ApiResponse<T>>(url, body, options as any)
      .pipe(
        map((response) => (response as unknown as ApiResponse<T>).data as T),
      );
  }

  patch<T>(url: string, body: any, options?: HttpOptions): Observable<T> {
    return this.http
      .patch<ApiResponse<T>>(url, body, options as any)
      .pipe(
        map((response) => (response as unknown as ApiResponse<T>).data as T),
      );
  }

  put<T>(url: string, body: any, options?: HttpOptions): Observable<T> {
    return this.http
      .put<ApiResponse<T>>(url, body, options as any)
      .pipe(
        map((response) => (response as unknown as ApiResponse<T>).data as T),
      );
  }

  delete<T>(url: string, options?: HttpOptions): Observable<T> {
    return this.http
      .delete<ApiResponse<T>>(url, options as any)
      .pipe(
        map((response) => (response as unknown as ApiResponse<T>).data as T),
      );
  }
}
