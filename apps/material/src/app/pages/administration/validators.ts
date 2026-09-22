import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

function greaterThanValidator(
  threshold: number,
  errorKey: string,
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (value === null || value === undefined || value === '') {
      return null;
    }
    const numeric = Number(value);
    return Number.isNaN(numeric) || numeric > threshold
      ? null
      : { [errorKey]: { value: numeric, threshold } };
  };
}

export {
  greaterThanValidator,
}
