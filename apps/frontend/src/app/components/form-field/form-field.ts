import { Component, computed, input, output } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { NoFocusJumpDirective } from '../../core/no-focus-jump.directive';
import { LucideFrown } from '@lucide/angular';

@Component({
  selector: 'app-form-field',
  standalone: true,
  imports: [FormField, NoFocusJumpDirective, LucideFrown],
  template: `
    <div class="form-control">
      <label class="label" [attr.for]="inputId()">
        <span class="label-text font-semibold">{{ label() }}</span>
      </label>

      @if (type() === 'select') {
        <select
          appNoFocusJump
          [id]="inputId()"
          [formField]="control()"
          class="select select-bordered w-full"
        >
          @if (placeholder()) {
            <option value="" disabled selected>{{ placeholder() }}</option>
          }
          @for (cat of items(); track cat) {
            <option [value]="cat">{{ cat }}</option>
          }
        </select>
      } @else if (type() === 'textarea') {
        <textarea
          appNoFocusJump
          [id]="inputId()"
          [formField]="control()"
          class="textarea textarea-bordered w-full h-28"
        ></textarea>
      } @else if (this.type() === 'checkbox') {
        <div class="flex items-center h-12">
          <input
            type="checkbox"
            appNoFocusJump
            [id]="inputId()"
            [formField]="control()"
            class="checkbox checkbox-primary"
            [class.checkbox-error]="inputError()"
            (change)="handleInput.emit($event)"
          />
          <ng-content></ng-content>
        </div>
      } @else {
        <input
          appNoFocusJump
          [type]="type()"
          [id]="inputId()"
          [formField]="control()"
          class="input input-bordered w-full"
          [class.input-error]="inputError()"
          [attr.step]="step()"
          (input)="handleInput.emit($event)"
        />
      }

      @if (formState()?.touched() && formState()?.invalid()) {
        <div class="mt-1">
          <ul class="space-y-1">
            @for (error of formState()?.errors() ?? []; track error.message) {
              <li class="flex items-center gap-1 text-xs text-error">
                <svg lucideFrown height="10" width="10"></svg>
                <span>{{ error.message }}</span>
              </li>
            }
          </ul>
        </div>
      }
    </div>
  `,
  styles: [],
})
export class FormFieldComponent {
  control = input.required<any>();
  inputId = input.required<string>();
  label = input.required<string>();
  items = input<any[]>([]);
  type = input('text');
  step = input<string | undefined>(undefined);
  error = input(false);
  fullWidth = input(false);
  handleInput = output<Event>();
  placeholder = input<string>('');

  readonly formState = computed(() => {
    const value = this.control();
    return typeof value === 'function' ? value() : value;
  });

  readonly inputError = computed(
    () =>
      this.error() ||
      (this.formState()?.touched() && this.formState()?.invalid()),
  );
}
