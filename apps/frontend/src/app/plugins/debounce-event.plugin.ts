import { Injectable, DOCUMENT, inject } from '@angular/core';
import { EventManagerPlugin } from '@angular/platform-browser';

@Injectable()
export class DebounceEventManagerPlugin extends EventManagerPlugin {
  constructor() {
    // We manually fetch the DOCUMENT and pass it to the undecorated base class
    super(inject(DOCUMENT));
  }

  // This tells Angular: "I handle any event that looks like 'input.debounce.500'"
  override supports(eventName: string): boolean {
    return eventName.includes('.debounce');
  }

  override addEventListener(
    element: HTMLElement,
    eventName: string,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    handler: Function,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  ): Function {
    const parts = eventName.split('.');
    const baseEvent = parts[0]; // 'input'
    const delay = parseInt(parts[2] || '300', 10); // '500' or default 300

    let timeout: NodeJS.Timeout;

    const debouncedHandler = (event: Event) => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => handler(event), delay);
    };

    element.addEventListener(baseEvent, debouncedHandler);

    // Return a function to remove the listener (cleanup)
    return () => {
      element.removeEventListener(baseEvent, debouncedHandler);
      if (timeout) clearTimeout(timeout);
    };
  }
}
