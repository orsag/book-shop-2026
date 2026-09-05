import {
  TranslocoTestingModule,
  TranslocoTestingOptions,
} from '@jsverse/transloco';
import en from '../../assets/i18n/en.json';
import sk from '../../assets/i18n/sk.json';

export function getTranslocoModule(options: TranslocoTestingOptions = {}) {
  return TranslocoTestingModule.forRoot({
    langs: { en, sk },
    translocoConfig: {
      availableLangs: ['en', 'sk'],
      defaultLang: 'sk',
    },
    preloadLangs: true,
    ...options,
  });
}
