import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { LOGGER } from './logger.token';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const logger = inject(LOGGER);

  // Skip video/media stream endpoints
  if (req.url.includes('/videos/')) {
    return next(req);
  }

  const authReq = req.clone({ withCredentials: true });

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        const isLoginRequest = authReq.url.includes('/login');

        if (!isLoginRequest) {
          logger.error('Session expired. Redirecting to login...');
          router.navigateByUrl('/login');
        }
      }

      return throwError(() => error);
    }),
  );
};
