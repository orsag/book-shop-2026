// auth.interceptor.ts
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AppStore } from '../store/app-store';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { ErrorCodes, ErrorHandlerService } from './error.handler';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const store = inject(AppStore);
  const token = store.token();
  const router = inject(Router);
  const errorService = inject(ErrorHandlerService);

  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // --- 🚨 TOKEN EXPIRED OR INVALID ---
        console.warn('Session expired. Logging out...');

        // 1. Wipe the store and LocalStorage
        store.logout();
        errorService.handleError(ErrorCodes.FORCE_LOGOUT);

        // 2. Send them back to login
        router.navigate(['/login']);
      }

      return throwError(() => error);
    }),
  );
};
