import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'cast',
  standalone: true,
  pure: true,
})
export class CastPipe implements PipeTransform {
  // Accepts a value and a type token, returning the value forced as that type
  transform<T>(value: any, _typeToken: T): T {
    return value as T;
  }
}
