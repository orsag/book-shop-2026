// logger.token.ts
import { InjectionToken } from '@angular/core';

// 1. Spoločný kontrakt (interface) pre logger
export interface Logger {
  log(message: string, ...optionalParams: unknown[]): void;
  error(message: string, ...optionalParams: unknown[]): void;
}

// 2. Token pre logger
export const LOGGER = new InjectionToken<Logger>('LOGGER');
