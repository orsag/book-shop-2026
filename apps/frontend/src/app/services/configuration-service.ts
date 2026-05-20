import { Injectable, signal, effect, inject, PLATFORM_ID } from '@angular/core';
import { FeatureName, FEATURES } from '@store/shared-models';
import { isPlatformBrowser } from '@angular/common';
type FeatureFlags = Record<FeatureName, boolean>;

@Injectable({
  providedIn: 'root',
})
export class ConfigurationService {
  private readonly STORAGE_KEY = 'app_config';
  private readonly THEME_KEY = 'app_theme';

  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  readonly flags = signal<FeatureFlags>(this.loadFlags());
  readonly theme = signal<string>(
    this.isBrowser ? localStorage.getItem(this.THEME_KEY) || 'light' : 'light',
  );

  constructor() {
    // Automatically persist to localStorage whenever flags change
    effect(() => {
      if (this.isBrowser) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.flags()));
      }
    });

    // Automatically apply theme to <html> tag whenever it changes
    effect(() => {
      const currentTheme = this.theme();
      if (this.isBrowser) {
        localStorage.setItem(this.THEME_KEY, currentTheme);
        document.documentElement.setAttribute('data-theme', currentTheme);
      }
    });
  }

  private loadFlags(): FeatureFlags {
    // Initialize the object using the strict type
    const defaults = {} as FeatureFlags;

    // Populate defaults from your constants
    const keys = Object.keys(FEATURES) as FeatureName[];
    for (const key of keys) {
      defaults[key] = FEATURES[key].defaultValue;
    }

    if (!this.isBrowser) {
      return defaults;
    }

    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      try {
        const savedObj = JSON.parse(saved);
        // Only merge keys that actually exist in our FeatureName definition
        for (const key in savedObj) {
          if (key in defaults) {
            defaults[key as FeatureName] = savedObj[key];
          }
        }
      } catch (e) {
        console.error('Failed to parse saved flags', e);
      }
    }

    return defaults;
  }

  toggleFlag(name: FeatureName) {
    this.flags.update((f) => ({
      ...f,
      [name]: !f[name], // Works perfectly because f[name] is a boolean
    }));
  }

  toggleTheme() {
    this.theme.set(this.theme() === 'light' ? 'dark' : 'light');
  }

  setTheme(newTheme: string) {
    this.theme.set(newTheme);
  }
}
