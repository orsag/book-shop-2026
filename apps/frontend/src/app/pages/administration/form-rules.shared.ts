// form-rules.shared.ts
import {
  max,
  maxLength,
  min,
  minLength,
  required,
} from '@angular/forms/signals';

export function applyCommonProductRules(
  schemaPath: any
) {
  required(schemaPath.name, {
    message: 'Title is required',
  });
  minLength(schemaPath.name, 3, {
    message: 'Title must be min 3 chars',
  });
  maxLength(schemaPath.name, 50, {
    message: 'Title must be max 50 chars',
  });
  min(schemaPath.availableCount, 0, {
    message: 'Available count must be min 0',
  });
  min(schemaPath.discount, 0, {
    message: 'Discount must be min 0',
  });
  max(schemaPath.discount, 1, {
    message: 'Discount must be max 1',
  });
}
