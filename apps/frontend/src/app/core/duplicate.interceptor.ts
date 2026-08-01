import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn, HttpEvent,
} from '@angular/common/http';
import { shareReplay } from 'rxjs/operators';
import { Observable } from 'rxjs';

// Mapa pre ukladanie aktívnych požiadaviek
const activeRequests = new Map<string, Observable<HttpEvent<unknown>>>();

export const duplicateRequestInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
) => {
  // 1. Skip non-GET requests AND video/media stream endpoints
  if (req.method !== 'GET' || req.url.includes('/videos/')) {
    return next(req);
  }

  const cacheKey = req.urlWithParams;

  if (activeRequests.has(cacheKey)) {
    // Ak už rovnaká požiadavka beží, vrátime jej existujúci prúd
    return activeRequests.get(cacheKey) as Observable<HttpEvent<unknown>>;
  }

  // Ak nebeží, spustíme ju a pridáme shareReplay
  const sharedResponse = next(req).pipe(shareReplay(1));

  activeRequests.set(cacheKey, sharedResponse);

  // Po dokončení (alebo chybe) ju vymažeme z mapy aktívnych požiadaviek
  sharedResponse.subscribe({
    complete: () => activeRequests.delete(cacheKey),
    error: () => activeRequests.delete(cacheKey),
  });

  return sharedResponse;
};
