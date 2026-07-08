import { TestBed } from '@angular/core/testing';
import { describe, it, beforeEach, afterEach, expect, vi } from 'vitest';
import { ToastService } from './toast-service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    // 1. Tell Vitest to hijack global timers (setTimeout, Date.now, etc.)
    vi.useFakeTimers();

    TestBed.configureTestingModule({
      providers: [ToastService],
    });
    service = TestBed.inject(ToastService);
  });

  afterEach(() => {
    // 2. Clean up and restore real timers after each test
    vi.useRealTimers();
  });

  it('should be created with an empty list of toasts', () => {
    expect(service).toBeTruthy();
    expect(service.toasts()).toEqual([]);
  });

  describe('Adding Toasts', () => {
    it('should add a basic toast with default settings', () => {
      // You no longer need vi.setSystemTime(mockTime) here!

      service.show('Hello World');

      const activeToasts = service.toasts();
      expect(activeToasts.length).toBe(1);

      // expect.any(String) acts as a flexible wildcard for the UUID string
      expect(activeToasts[0]).toEqual({
        id: expect.any(String),
        text: 'Hello World',
        type: 'info',
      });
    });

    it('should support shorthand methods for success, alert, and info', () => {
      service.success('Success message');
      service.alert('Alert message');
      service.info('Info message');

      const activeToasts = service.toasts();
      expect(activeToasts.length).toBe(3);
      expect(activeToasts[0].type).toBe('success');
      expect(activeToasts[1].type).toBe('alert');
      expect(activeToasts[2].type).toBe('info');
    });
  });

  describe('Auto-removing Toasts (Timers)', () => {
    it('should automatically remove a toast after its specified duration', () => {
      // 1. Create a toast with a 3000ms duration
      service.show('Temporary Toast', 'info', 3000);
      expect(service.toasts().length).toBe(1);

      // 2. Fast-forward time by 2999 milliseconds (just before timeout)
      vi.advanceTimersByTime(2999);
      expect(service.toasts().length).toBe(1); // Toast should still be here

      // 3. Move forward 1 more millisecond (total 3000ms elapsed)
      vi.advanceTimersByTime(1);
      expect(service.toasts().length).toBe(0); // Toast is gone!
    });

    it('should handle multiple toasts with different durations correctly', () => {
      service.show('Quick Toast', 'success', 1000);
      service.show('Slow Toast', 'alert', 5000);
      expect(service.toasts().length).toBe(2);

      // Fast-forward past the first toast's duration
      vi.advanceTimersByTime(1500);
      expect(service.toasts().length).toBe(1);
      expect(service.toasts()[0].text).toBe('Slow Toast');

      // Fast-forward past the second toast's duration
      vi.advanceTimersByTime(4000);
      expect(service.toasts().length).toBe(0);
    });
  });
});
