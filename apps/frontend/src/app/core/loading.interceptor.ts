import {
  HttpContext,
  HttpContextToken,
  HttpInterceptorFn,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { LoadingService } from './loading.service';

/**
 * Context token used to tag HTTP requests that should drive the global
 * loading UI. Default `null` = request is NOT tracked (background calls like
 * translations, polling or token refresh stay invisible).
 *
 * Tag a call in any service:
 *   this.api.get(url, { context: withLoadingKey('login') })
 */
export const LOADING_KEY = new HttpContextToken<string | null>(() => null);

/** Small helper so services don't need to import HttpContext themselves. */
export function withLoadingKey(key: string): HttpContext {
  return new HttpContext().set(LOADING_KEY, key);
}

/**
 * Global loading interceptor.
 *
 * - reads the tag from the request's HttpContext (survives .clone() in other
 *   interceptors, e.g. authInterceptor adding the Bearer header)
 * - untagged requests pass through untouched
 * - `finalize` fires on success, error AND unsubscribe (e.g. switchMap
 *   cancellation), so the counter can never leak
 */
export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const key = req.context.get(LOADING_KEY);
  if (!key) {
    return next(req);
  }

  const loading = inject(LoadingService);
  loading.track(key);

  return next(req).pipe(finalize(() => loading.untrack(key)));
};
