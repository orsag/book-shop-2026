/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import { Injectable } from '@angular/core';
import { EventManagerPlugin } from '@angular/platform-browser';

@Injectable()
export class StopEventPlugin extends EventManagerPlugin {
  constructor() {
    super(document);
  }

  // Matches any event containing '.stop', e.g., (click.stop) or (submit.stop)
  override supports(eventName: string): boolean {
    return eventName.split('.').includes('stop');
  }

  override addEventListener(
    element: HTMLElement,
    eventName: string,
    handler: Function,
  ): Function {
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
