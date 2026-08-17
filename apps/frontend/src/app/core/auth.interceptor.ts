// auth.interceptor.ts
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AppStore } from '@store';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const store = inject(AppStore);
  const token = store.token();
  const router = inject(Router);

  // 1. Skip video/media stream endpoints
  if (req.url.includes('/videos/')) {
    return next(req);
  }

  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        const isLoginRequest = authReq.url.includes('/login');

        if (!isLoginRequest) {
          console.warn('Session expired. Redirecting to login...');
          router.navigateByUrl('/login');
        }
      }

      return throwError(() => error);
    }),
  );
};;
