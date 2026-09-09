import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  isDevMode,
  provideAppInitializer,
  inject,
  LOCALE_ID,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { registerLocaleData } from '@angular/common';
import localeSk from '@angular/common/locales/sk';
import { provideTransloco } from '@jsverse/transloco';
import { appRoutes } from './app.routes';
import {
  ConsoleLogger,
  LOGGER,
  NoopLogger,
  TranslationsHttpLoader,
} from '@core';
import { EVENT_MANAGER_PLUGINS } from '@angular/platform-browser';
import { DebounceEventManagerPlugin } from './plugins/debounce-event.plugin';
import { StopEventPlugin } from './plugins/stop-event.plugin';
import { InitializationService } from '@service';

// Register locale data globally before configuration initialization
registerLocaleData(localeSk, 'sk-SK');

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(appRoutes),
    provideHttpClient(),
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