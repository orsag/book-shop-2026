// auth.interceptor.ts
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AppStore } from '../store/app-store';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { ErrorCodes, ErrorService } from './error.handler';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const store = inject(AppStore);
  const token = store.token();
  const router = inject(Router);
  const errorService = inject(ErrorService);

  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // 1. Check if the failed request was actually the login attempt itself
        const isLoginRequest = authReq.url.includes('/login'); // Adjust this path to match your actual API route

        if (isLoginRequest) {
          // --- 🔒 FAILED LOGIN ATTEMPT ---
          // Do NOT force logout or navigate. Just pass the error back to the AppStore
          console.log('Invalid credentials entered.');
        } else {
          // --- 🚨 TOKEN EXPIRED OR INVALID (Session expired) ---
          console.warn('Session expired. Logging out...');

          // Wipe the store and LocalStorage
          store.logout();

          // Send them back to login
          router.navigate(['/login']);
        }
      }

      return throwError(() => error);
    }),
  );
};
