/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import { Injectable, inject, PLATFORM_ID, DOCUMENT } from '@angular/core';
import { EventManagerPlugin } from '@angular/platform-browser';
import { isPlatformBrowser } from '@angular/common';

@Injectable()
export class StopEventPlugin extends EventManagerPlugin {
  private platformId = inject(PLATFORM_ID);

  constructor() {
    super(inject(DOCUMENT)); // Pass the safe document abstraction to parent
  }

  // Matches any event containing '.stop', e.g., (click.stop) or (submit.stop)
  override supports(eventName: string): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;
    return eventName.split('.').includes('stop');
  }

  override addEventListener(
    element: HTMLElement,
    eventName: string,
    handler: Function,
  ): Function {
    if (!isPlatformBrowser(this.platformId)) {
      return () => { /* empty */ };
    }

    const realEventName = eventName.replace('.stop', '');

    // Intercept the event, stop propagation, then run the original handler
    const wrapper = (event: Event) => {
      event.stopPropagation();
      handler(event);
    };

    // Delegate back to the manager to attach the listener safely
    return this.manager.addEventListener(element, realEventName, wrapper);
  }
}
