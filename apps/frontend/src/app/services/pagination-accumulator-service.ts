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
   * @param pageSignal Signal emitting the current page number
   * @param appendModeSignal Signal indicating whether to append or replace
   * @param extractDataFn Function to extract the items array from response object
   * @returns Observable of accumulated items array
   */
  accumulate<TResource, TItem>(
    resource: Resource<TResource>,
    pageSignal: Signal<number>,
    appendModeSignal: Signal<boolean>,
    extractDataFn: (data: TResource | undefined) => TItem[],
  ): Observable<TItem[]> {
    const stableResource = withPreviousValue(resource);
    const pageMap = new Map<number, TItem[]>();

    const value$ = toObservable(stableResource.value);
    const page$ = toObservable(pageSignal);
    const appendMode$ = toObservable(appendModeSignal);
    const status$ = toObservable(stableResource.status);

    return combineLatest([value$, page$, appendMode$, status$]).pipe(
      map(([value, currentPage, isAppend, status]) => {
        const freshItems = extractDataFn(value);

        if (!freshItems || freshItems.length === 0) {
          if (!isAppend && currentPage === 1) {
            pageMap.clear();
          }
          return Array.from(pageMap.keys())
            .sort((a, b) => a - b)
            .flatMap((p) => pageMap.get(p) ?? []);
        }

        if (status === ('resolved' as ResourceStatus)) {
          if (isAppend) {
            pageMap.set(currentPage, freshItems);
          } else {
            pageMap.clear();
            pageMap.set(currentPage, freshItems);
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
