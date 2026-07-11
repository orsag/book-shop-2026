import '@angular/compiler';
import 'zone.js';
import 'zone.js/testing';

import { TestBed } from '@angular/core/testing';
// Import from the non-deprecated /platform-browser package
import {
  BrowserTestingModule,
  platformBrowserTesting,
} from '@angular/platform-browser/testing';
import { EVENT_MANAGER_PLUGINS } from '@angular/platform-browser';
import { DebounceEventManagerPlugin } from './app/plugins/debounce-event.plugin';
import { StopEventPlugin } from './app/plugins/stop-event.plugin';
import { LOCALE_ID, NgModule } from '@angular/core';

// 1. Import Angular's locale data for Slovak
import { registerLocaleData } from '@angular/common';
import localeSk from '@angular/common/locales/sk';

// 2. Register it globally into Angular's runtime database
registerLocaleData(localeSk, 'sk-SK');

// 1. Create a custom module that acts as your global testing module
@NgModule({
  imports: [BrowserTestingModule], // Inherit the necessary browser configurations
  providers: [
    {
      provide: EVENT_MANAGER_PLUGINS,
      useClass: DebounceEventManagerPlugin,
      multi: true,
    },
    {
      provide: EVENT_MANAGER_PLUGINS,
      useClass: StopEventPlugin,
      multi: true,
    },
    { provide: LOCALE_ID, useValue: 'sk-SK' },
  ],
})
class GlobalTestModule {}

// Initialize the environment using the modern platform utilities
try {
  TestBed.initTestEnvironment(GlobalTestModule, platformBrowserTesting());
} catch {
  // Prevent double-initialization errors if Vitest hot-reloads
}
