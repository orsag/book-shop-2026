// field-error.component.ts
import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-field-error',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (
      field() && field()!.invalid() && (field()!.touched() || field()!.dirty())
    ) {
      <label class="label pt-1 pb-0">
        <span class="label-text-alt text-error font-medium">
          {{ field()!.errors()?.[0]?.message || defaultMessage() }}
        </span>
      </label>
    }
  `,
})
export class FieldErrorComponent {
  // Accepts the signal field reference directly from your form schema
  readonly field = input<any>();
  readonly defaultMessage = input<string>('Invalid field');
}
