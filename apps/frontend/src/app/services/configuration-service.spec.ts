import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { describe, it, beforeEach, afterEach, expect, vi } from 'vitest';
import { ConfigurationService } from './configuration-service';
import { FeatureName } from '@store/shared-models';

// Mock the FEATURES constant if needed, or rely on production defaults.
// For this example, let's assume FEATURES has 'SHOW_FILTER' with a defaultValue of false.
vi.mock('@store/shared-models', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@store/shared-models')>();
  return {
    ...actual,
    FEATURES: {
      SHOW_FILTER: { defaultValue: false },
      // add other flags if your code relies on them
    },
  };
});

describe('ConfigurationService', () => {
  let service: ConfigurationService;

  beforeEach(() => {
    // 1. Clear localStorage before each test to ensure isolation
    localStorage.clear();
    // Reset document theme attribute
    document.documentElement.removeAttribute('data-theme');

    TestBed.configureTestingModule({
      providers: [
        ConfigurationService,
        // Explicitly provide the browser platform ID
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });

    service = TestBed.inject(ConfigurationService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should be created with default values', () => {
    expect(service).toBeTruthy();
    expect(service.theme()).toBe('light');
    expect(service.getFilterValue()).toBe(false);
  });

  // --- Testing Theme Logic ---
  describe('Theme Management', () => {
    it('should toggle the theme from light to dark', async () => {
      expect(service.theme()).toBe('light');

      service.toggleTheme();
      expect(service.theme()).toBe('dark');

      // Wait a microtask for Angular's effect() to update localStorage and the DOM
      await TestBed.flushEffects();

      expect(localStorage.getItem('app_theme')).toBe('dark');
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('should set an explicit theme', async () => {
      service.setTheme('cyberpunk');
      expect(service.theme()).toBe('cyberpunk');

      await TestBed.flushEffects();
      expect(localStorage.getItem('app_theme')).toBe('cyberpunk');
    });
  });

  // --- Testing Feature Flags Logic ---
  describe('Feature Flags', () => {
    it('should toggle a feature flag value', async () => {
      expect(service.getFilterValue()).toBe(false);

      service.toggleFlag('SHOW_FILTER' as FeatureName);
      expect(service.getFilterValue()).toBe(true);

      await TestBed.flushEffects();

      const savedFlags = JSON.parse(localStorage.getItem('app_config') || '{}');
      expect(savedFlags.SHOW_FILTER).toBe(true);
    });
  });

  // --- Testing Initial Loading Logic ---
  describe('Initialization from LocalStorage', () => {
    it('should load initial values from localStorage if they exist', () => {
      // Setup localStorage BEFORE the service is instantiated
      localStorage.setItem('app_theme', 'dark');
      localStorage.setItem('app_config', JSON.stringify({ SHOW_FILTER: true }));

      // Re-inject a fresh instance of the service to trigger constructor loading
      const freshService = TestBed.inject(ConfigurationService);

      expect(freshService.theme()).toBe('dark');
      expect(freshService.getFilterValue()).toBe(true);
    });
  });
});
