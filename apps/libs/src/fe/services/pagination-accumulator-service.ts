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

    // value$
    //   .pipe(
    //     filter((val) => val !== undefined), // Wait until data is loaded
    //   )
    //   .subscribe((val) => {
    //     console.log('Loaded value:', val);
    //   });

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

  /**
   * Observable-based sibling of {@link accumulate}: reads from a data stream
   * (`source$`, e.g. an NgRx selector) instead of a `Resource`, keeping the same
   * pagination/append semantics.
   *
   * @param source$ Observable emitting the current page response. It should keep
   *   emitting the PREVIOUS response while a new request is in flight (NgRx
   *   reducers that retain the last value do), mirroring {@link withPreviousValue}.
   * @param requestSignal Signal emitting the current request descriptor
   *   ({@link AccumulatorRequest}) - page number AND append flag atomically, so
   *   the accumulator never observes a `page` change while the previous `append`
   *   value is still active.
   * @param loading$ True while a fetch is in flight. The page map is only
   *   mutated when `false`, so an in-flight reload never stages duplicate or
   *   stale page entries. It must be emitted `true` ATOMICALLY with the request
   *   change (the reducer should set the loading flag inside the same state
   *   update that mutates `appendMode`/`page`). Error paths should emit a null/
   *   empty `source$` value, so the empty-data branch keeps the accumulated
   *   pages instead of writing stale ones.
   * @param extractDataFn Function to extract the items array from response object
   * @returns Observable of accumulated items array
   */
  accumulateFrom<TResource, TItem>(
    source$: Observable<TResource | null | undefined>,
    requestSignal: Signal<AccumulatorRequest>,
    loading$: Observable<boolean>,
    extractDataFn: (data: TResource | null | undefined) => TItem[],
  ): Observable<TItem[]> {
    const pageMap = new Map<number, TItem[]>();
    const request$ = toObservable(requestSignal);

    return combineLatest([source$, request$, loading$]).pipe(
      map(([value, request, loading]) => {
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

        if (!loading) {
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
