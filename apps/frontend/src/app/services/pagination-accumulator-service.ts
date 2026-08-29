import {
  Injectable,
  Signal,
  linkedSignal,
  resourceFromSnapshots,
  Resource,
  ResourceSnapshot,
  ResourceStatus,
} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Observable, combineLatest } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

/**
 * Describes a single page request. `append` is `true` when the request
 * continues the previous results (Load More) instead of replacing them.
 */
export type AccumulatorRequest = {
  page: number;
  append: boolean;
};

/**
 * Helper to preserve previous resource values while re-fetching
 */
export function withPreviousValue<T>(input: Resource<T>): Resource<T> {
  const derived = linkedSignal<ResourceSnapshot<T>, ResourceSnapshot<T>>({
    source: input.snapshot,
    computation: (snap, previous) => {
      if (
        snap.status === 'loading' &&
        previous &&
        previous.value.status !== 'error'
      ) {
        return { ...snap, value: previous.value.value };
      }
      return snap;
    },
  });

  return resourceFromSnapshots(derived);
}

@Injectable({
  providedIn: 'root',
})
export class PaginationAccumulatorService {
  /**
   * Accumulates resource data based on pagination and appendMode state.
   *
   * @param resource Raw Angular Resource containing paginated response
   * @param requestSignal Signal emitting the current request descriptor
   *   ({@link AccumulatorRequest}) - page number AND append flag atomically,
   *   so the accumulator never observes a `page` change while the previous
   *   `append` value is still active.
   * @param extractDataFn Function to extract the items array from response object
   * @returns Observable of accumulated items array
   */
  accumulate<TResource, TItem>(
    resource: Resource<TResource>,
    requestSignal: Signal<AccumulatorRequest>,
    extractDataFn: (data: TResource | undefined) => TItem[],
  ): Observable<TItem[]> {
    const stableResource = withPreviousValue(resource);
    const pageMap = new Map<number, TItem[]>();

    const value$ = toObservable(stableResource.value);
    const request$ = toObservable(requestSignal);
    const status$ = toObservable(stableResource.status);

    return combineLatest([value$, request$, status$]).pipe(
      map(([value, request, status]) => {
        const freshItems = extractDataFn(value);
        const { page, append } = request;

        if (!freshItems || freshItems.length === 0) {
          if (!append && page === 1) {
            pageMap.clear();
          }
          return Array.from(pageMap.keys())
            .sort((a, b) => a - b)
            .flatMap((p) => pageMap.get(p) ?? []);
        }

        if (status === ('resolved' as ResourceStatus)) {
          if (append) {
            pageMap.set(page, freshItems);
          } else {
            pageMap.clear();
            pageMap.set(page, freshItems);
          }
        }

        return Array.from(pageMap.keys())
          .sort((a, b) => a - b)
          .flatMap((p) => pageMap.get(p) ?? []);
      }),
      shareReplay({ bufferSize: 1, refCount: true }),
    );
  }
}
