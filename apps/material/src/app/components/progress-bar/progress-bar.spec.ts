import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { ProgressBarComponent } from './progress-bar';
import { LoadingService } from '@core';

describe('ProgressBarComponent', () => {
  let component: ProgressBarComponent;
  let loading: LoadingService;
  let fixture: ComponentFixture<ProgressBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgressBarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProgressBarComponent);
    component = fixture.componentInstance;
    loading = TestBed.inject(LoadingService);
    component.loaderDelay = 60;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be hidden initially', () => {
    const bar = fixture.nativeElement.querySelector('.progress-bar');
    expect(bar.classList.contains('progress-bar-hidden')).toBe(true);
    expect(component.isVisible()).toBe(false);
  });

  it('should show immediately when global loading starts', async () => {
    loading.track('products');
    fixture.detectChanges();

    await vi.waitFor(() => {
      expect(component.isVisible()).toBe(true);
    });

    const bar = fixture.nativeElement.querySelector('.progress-bar');
    expect(bar.classList.contains('progress-bar-hidden')).toBe(false);

    loading.untrack('products');
    fixture.detectChanges();
    await new Promise((r) => setTimeout(r, component.loaderDelay + 30));
  });

  it('should stay visible while a request is in flight', async () => {
    loading.track('products');
    fixture.detectChanges();
    await vi.waitFor(() => {
      expect(component.isVisible()).toBe(true);
    });

    await new Promise((r) => setTimeout(r, component.loaderDelay * 2));
    expect(component.isVisible()).toBe(true);

    loading.untrack('products');
    fixture.detectChanges();
    await new Promise((r) => setTimeout(r, component.loaderDelay + 30));
  });

  it('should hide only after the loader delay has elapsed', async () => {
    loading.track('products');
    fixture.detectChanges();
    await vi.waitFor(() => {
      expect(component.isVisible()).toBe(true);
    });

    loading.untrack('products');
    fixture.detectChanges();
    await new Promise((r) => setTimeout(r, component.loaderDelay / 2));

    expect(component.isVisible()).toBe(true);

    await new Promise((r) => setTimeout(r, component.loaderDelay + 30));
    expect(component.isVisible()).toBe(false);
  });

  it('should not hide when a new request starts during the hide delay', async () => {
    loading.track('products');
    fixture.detectChanges();
    await vi.waitFor(() => {
      expect(component.isVisible()).toBe(true);
    });

    loading.untrack('products');
    fixture.detectChanges();
    await new Promise((r) => setTimeout(r, component.loaderDelay / 2));

    loading.track('videos');
    fixture.detectChanges();
    await new Promise((r) => setTimeout(r, component.loaderDelay * 2));

    expect(component.isVisible()).toBe(true);

    loading.untrack('videos');
    fixture.detectChanges();
    await new Promise((r) => setTimeout(r, component.loaderDelay + 30));
    expect(component.isVisible()).toBe(false);
  });
});