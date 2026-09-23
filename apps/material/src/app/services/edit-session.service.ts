import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CreateProductDto } from '@api';

/**
 * Transient edit session for the current administration product.
 *
 * Picked a BehaviorSubject (not a plain Subject, not a signal) on purpose:
 *  - Three independent consumers read the SAME latest product: the edit
 *    dialog (opens asynchronously via MatDialog + TemplateRef), the save
 *    handler, and the delete handler. A BehaviorSubject synchronously
 *    exposes the value to any late subscriber via getValue(), so the
 *    dialog consumer never races ahead of the open() call.
 *  - next() multicasts to every consumer that subscribed via asObservable(),
 *    so we get one source of truth instead of three signal() copies.
 */
@Injectable({ providedIn: 'root' })
export class EditSessionService {
  private readonly subject = new BehaviorSubject<CreateProductDto | null>(null);

  /** Synchronous access for handlers that need the value right now. */
  get current(): CreateProductDto | null {
    return this.subject.getValue();
  }

  /** Reactive access for consumers (dialogs, effects) that subscribe late. */
  readonly product$ = this.subject.asObservable();

  setCurrent(product: CreateProductDto | null): void {
    this.subject.next(product);
  }

  clear(): void {
    this.subject.next(null);
  }
}
