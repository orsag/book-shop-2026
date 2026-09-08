import '@angular/compiler';
import '@analogjs/vitest-angular/setup-snapshots';
import { setupTestBed } from '@analogjs/vitest-angular/setup-testbed';

import { registerLocaleData } from '@angular/common';
import localeSk from '@angular/common/locales/sk';

registerLocaleData(localeSk, 'sk-SK');

setupTestBed();
