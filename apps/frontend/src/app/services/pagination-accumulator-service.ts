import {
  Injectable,
  Signal,
  computed,
  linkedSignal,
  resourceFromSnapshots,
  Resource,
  ResourceSnapshot,
  untracked,
} from '@angular/core';

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
   * @returns Signal of accumulated items array
   */
  accumulate<TResource, TItem>(
    resource: Resource<TResource>,
    pageSignal: Signal<number>,
    appendModeSignal: Signal<boolean>,
    extractDataFn: (data: TResource | undefined) => TItem[],
  ): Signal<TItem[]> {
    const stableResource = withPreviousValue(resource);
    const pageMap = new Map<number, TItem[]>();

    return computed(() => {
      const res = stableResource.value();
      const freshItems = extractDataFn(res);
      const currentPage = pageSignal();
      const isAppend = untracked(() => appendModeSignal());

      if (!freshItems || freshItems.length === 0) {
        if (!isAppend && currentPage === 1) {
          pageMap.clear();
        }
        return Array.from(pageMap.keys())
          .sort((a, b) => a - b)
          .flatMap((p) => pageMap.get(p) ?? []);
      }

      if (isAppend) {
        pageMap.set(currentPage, freshItems);
      } else {
        pageMap.clear();
        pageMap.set(currentPage, freshItems);
      }

      return Array.from(pageMap.keys())
        .sort((a, b) => a - b)
        .flatMap((p) => pageMap.get(p) ?? []);
    });
  }
}
