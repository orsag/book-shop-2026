import { Injectable, computed, signal } from '@angular/core';

/**
 * Central HTTP loading tracker.
 *
 * The loadingInterceptor increments/decrements per-key counters here; UI can
 * subscribe to either the global flag or a specific operation key:
 *
 *   loading.isGlobalLoading()            // any tracked request in flight
 *   loading.isLoading('login')()         // template: loading.isLoading('login')
 */
@Injectable({ providedIn: 'root' })
export class LoadingService {
  /** key -> number of in-flight requests tagged with that key */
  private readonly pending = signal<Record<string, number>>({});

  /** True while at least ONE tracked request is in flight (global spinner). */
  readonly isGlobalLoading = computed(() =>
    Object.values(this.pending()).some((count) => count > 0),
  );

  /**
   * True while requests tagged with `key` are in flight.
   * Safe to call from templates - Angular tracks the internal signal read,
   * so bindings like [disabled]="loading.isLoading('login')" stay reactive.
   */
  isLoading(key: string): boolean {
    return (this.pending()[key] ?? 0) > 0;
  }

  track(key: string): void {
    this.pending.update((current) => ({
      ...current,
      [key]: (current[key] ?? 0) + 1,
    }));
  }

  untrack(key: string): void {
    this.pending.update((current) => {
      const next = { ...current };
      const count = (next[key] ?? 0) - 1;
      if (count <= 0) {
        delete next[key]; // keep the record clean of zero entries
      } else {
        next[key] = count;
      }
      return next;
    });
  }
}
