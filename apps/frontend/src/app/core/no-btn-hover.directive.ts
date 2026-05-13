import { Directive } from '@angular/core';

@Directive({
  // This selector targets any element that has the 'btn' class
  selector: '[appNoHoverButton]',
  standalone: true,
  host: {
    // Standard Hover Neutralization
    '[class.hover:bg-transparent]': 'true',
    '[class.hover:border-transparent]': 'true',
    '[class.hover:shadow-none]': 'true',

    // Focus Neutralization (This is what's hitting your <div>)
    '[class.focus:bg-transparent]': 'true',
    '[class.focus:border-transparent]': 'true',
    '[class.focus:outline-none]': 'true',

    // DaisyUI Dropdown Specifics
    // Prevents the background from changing when the dropdown is active
    '[class.group-focus:bg-transparent]': 'true',
    '[class.active:bg-transparent]': 'true',
  },
})
export class NoBtnHoverDirective {}
