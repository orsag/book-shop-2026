import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
} from '@angular/common/http';
import { shareReplay } from 'rxjs/operators';

// Mapa pre ukladanie aktívnych požiadaviek
const activeRequests = new Map<string, any>();

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
    return activeRequests.get(cacheKey);
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
