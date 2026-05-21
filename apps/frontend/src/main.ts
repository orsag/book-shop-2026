import { bootstrapApplication } from '@angular/platform-browser';
import localeSk from '@angular/common/locales/sk';
import { registerLocaleData } from '@angular/common';
import { appConfig } from './app/app.config';
import { App } from './app/app';

registerLocaleData(localeSk);

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
