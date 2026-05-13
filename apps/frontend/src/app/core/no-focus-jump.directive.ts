import { Directive, HostBinding } from '@angular/core';

@Directive({
  selector: '[appNoFocusJump]',
  standalone: true, // Set to false if using modules
})
export class NoFocusJumpDirective {
  // We bind the 14 "peace treaty" classes here
  @HostBinding('class')
  get elementClasses() {
    return [
      'border',
      'border-base-content/20!',
      'outline-none!',
      'ring-0!',
      'shadow-none!',
      'focus-within:border-base-content/20!',
      'focus-within:outline-none!',
      'focus-within:ring-0!',
      'transition-none', // Bonus: prevents any tiny color fading jumps
    ].join(' ');
  }
}
