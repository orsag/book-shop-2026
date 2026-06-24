import {
  isDevMode,
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  LOCALE_ID,
} from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';
import { appRoutes } from './app.routes';
import {
  provideHttpClient,
  withInterceptors,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { provideTransloco } from '@jsverse/transloco';
import { TranslationsHttpLoader } from './core/transloco-loader';
import { DebounceEventManagerPlugin } from './plugins/debounce-event.plugin';
import { EVENT_MANAGER_PLUGINS } from '@angular/platform-browser';
import { authInterceptor } from './core/auth.interceptor';
import { StopEventPlugin } from './plugins/stop-event.plugin';
import { duplicateRequestInterceptor } from './core/duplicate.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(appRoutes, withViewTransitions()),
    provideHttpClient(
      withInterceptors([authInterceptor, duplicateRequestInterceptor]),
      withInterceptorsFromDi(),
    ),
    provideTransloco({
      config: {
        availableLangs: ['en', 'sk'],
        defaultLang: 'sk',
        reRenderOnLangChange: true,
        prodMode: !isDevMode(),
      },
      loader: TranslationsHttpLoader,
    }),
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
};
