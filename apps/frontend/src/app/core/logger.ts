// loggers.ts
import { Logger } from './logger.token';

export class ConsoleLogger implements Logger {
  log(message: string, ...optionalParams: unknown[]): void {
    console.log(`[DEV LOG]: ${message}`, ...optionalParams);
  }

  error(message: string, ...optionalParams: unknown[]): void {
    console.error(`[DEV ERROR]: ${message}`, ...optionalParams);
  }
}

// Produkčná verzia (neurobí absolútne nič)
export class NoopLogger implements Logger {
  log(): void { /* empty */ }
  error(): void { /* empty */ }
}
