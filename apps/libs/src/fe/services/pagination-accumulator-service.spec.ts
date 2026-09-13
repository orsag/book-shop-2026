import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { Subject } from 'rxjs';
import {
  AccumulatorRequest,
  PaginationAccumulatorService,
} from './pagination-accumulator-service';

interface MockPage {
  data: string[];
}

function extract(data: MockPage | undefined): string[] {
  return data?.data ?? [];
}

describe('PaginationAccumulatorService.accumulateFrom', () => {
  let service: PaginationAccumulatorService;
  let request: ReturnType<typeof signal<AccumulatorRequest>>;
  let source$: Subject<MockPage | null>;
  let loading$: Subject<boolean>;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PaginationAccumulatorService);
    request = signal<AccumulatorRequest>({ page: 1, append: false });
    source$ = new Subject<MockPage | null>();
    loading$ = new Subject<boolean>();
  });

  function collect(): string[][] {
    const seen: string[][] = [];
    TestBed.runInInjectionContext(() => {
      service
        .accumulateFrom(source$, request, loading$, extract)
        .subscribe((value) => seen.push(value));
    });
    return seen;
  }

  /** Angular signal notifications are scheduled asynchronously; flush a macrotask
   *  so `toObservable`/`combineLatest` have seen the request signal's first value. */
  async function flush(): Promise<void> {
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
  }

  it('emits the extracted items for an initial page-1 request once resolved', async () => {
    const seen = collect();
    await flush();

    loading$.next(false);
    source$.next({ data: ['A1'] });

    expect(seen.at(-1)).toEqual(['A1']);
  });

  it('accumulates appended pages without showing duplicates while loading', async () => {
    const seen = collect();
    await flush();

    loading$.next(false);
    source$.next({ data: ['A1'] });
    expect(seen.at(-1)).toEqual(['A1']);

    // Page 2 request starts; the reducer sets the loading flag atomically with the
    // request change, so loading is already true before the request is observed.
    loading$.next(true);
    request.set({ page: 2, append: true });
    await flush();
    source$.next({ data: [] });
    // Must NOT stage page 2 with page-1 leftovers during loading.
    expect(seen.at(-1)).toEqual(['A1']);

    // Response arrives; still loading until the store flips the flag.
    source$.next({ data: ['B2'] });
    loading$.next(false);
    expect(seen.at(-1)).toEqual(['A1', 'B2']);
  });

  it('replaces accumulated pages on a non-append page-1 request once resolved', async () => {
    const seen = collect();
    await flush();

    loading$.next(false);
    source$.next({ data: ['A1'] });
    request.set({ page: 2, append: true });
    await flush();
    loading$.next(true);
    source$.next({ data: ['B2'] });
    loading$.next(false);
    expect(seen.at(-1)).toEqual(['A1', 'B2']);

    // Reset to a fresh page-1 fetch.
    request.set({ page: 1, append: false });
    await flush();
    loading$.next(false);
    source$.next({ data: ['C1'] });
    expect(seen.at(-1)).toEqual(['C1']);
  });

  it('keeps the previous items while a fresh page-1 request is still loading', async () => {
    const seen = collect();
    await flush();

    loading$.next(false);
    source$.next({ data: ['A1'] });

    request.set({ page: 1, append: false });
    loading$.next(true);
    expect(seen.at(-1)).toEqual(['A1']);

    loading$.next(false);
    source$.next({ data: ['D1'] });
    expect(seen.at(-1)).toEqual(['D1']);
  });

  it('clears the page map when a fresh page-1 request resolves with no data', async () => {
    const seen = collect();
    await flush();

    loading$.next(false);
    source$.next({ data: [] });

    expect(seen.at(-1)).toEqual([]);
  });
});