// auth.interceptor.ts
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AppStore } from '../store/app-store';
import { catchError, throwError, finalize } from 'rxjs';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const store = inject(AppStore);
  const token = store.token();
  const router = inject(Router);
  let isError401 = false;

  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        isError401 = true;
        // 1. Check if the failed request was actually the login attempt itself
        const isLoginRequest = authReq.url.includes('/login'); // Adjust this path to match your actual API route

        if (isLoginRequest) {
          // --- 🔒 FAILED LOGIN ATTEMPT ---
          // Do NOT force logout or navigate. Just pass the error back to the AppStore
          console.log('Invalid credentials entered.');
        } else {
          // --- 🚨 TOKEN EXPIRED OR INVALID (Session expired) ---
          console.warn('Session expired. Logging out...');

          // Send them back to login
          router.navigateByUrl('/login');
        }
      }

      return throwError(() => error);
    }),
    finalize(() => {
      if (isError401) {
        // Wipe the store and LocalStorage
        store.logout();
      }
    }),
  );
};
