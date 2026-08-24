// logger.token.ts
import { InjectionToken } from '@angular/core';

// Spoločný kontrakt
export interface Logger {
  log(message: string, ...optionalParams: unknown[]): void;
  error(message: string, ...optionalParams: unknown[]): void;
}

export const LOGGER = new InjectionToken<Logger>('LOGGER');
