import { Directive, input } from '@angular/core';

@Directive({
  selector: '[appTooltip]',
  standalone: true,
  host: {
    // Apply daisyUI + Tailwind tooltip classes directly to host
    '[class.tooltip]': 'true',
    '[class.tooltip-bottom]': 'true', // Centers down
    '[attr.data-tip]': 'appTooltip()', // daisyUI uses data-tip for the message
  },
})
export class TooltipDirective {
  // Accepts string or empty/null
  appTooltip = input.required<string>();
}
