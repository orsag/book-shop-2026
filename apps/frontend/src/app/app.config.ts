import {
  isDevMode,
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  LOCALE_ID,
  provideAppInitializer,
  inject,
} from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';
import { appRoutes } from './app.routes';
import {
  provideHttpClient,
  withInterceptors,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { provideTransloco } from '@jsverse/transloco';
import {
  authInterceptor,
  loadingInterceptor,
  TranslationsHttpLoader,
} from '@core';
import { DebounceEventManagerPlugin } from './plugins/debounce-event.plugin';
import {
  EVENT_MANAGER_PLUGINS,
} from '@angular/platform-browser';
import { StopEventPlugin } from './plugins/stop-event.plugin';
import localeSk from '@angular/common/locales/sk';
import { registerLocaleData } from '@angular/common';
import { InitializationService } from '@service';
import { LOGGER } from './core/logger.token';
import { ConsoleLogger, NoopLogger } from './core/logger';

// Register locale data globally before configuration initialization
registerLocaleData(localeSk, 'sk-SK');

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(appRoutes, withViewTransitions()),
    provideHttpClient(
      withInterceptors([loadingInterceptor, authInterceptor]),
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
    {
      provide: LOGGER,
      useClass: isDevMode() ? ConsoleLogger : NoopLogger,
    },
    provideAppInitializer(() => {
      const initialService = inject(InitializationService);
      return initialService.main();
    }),
    { provide: LOCALE_ID, useValue: 'sk-SK' },
  ],
};
