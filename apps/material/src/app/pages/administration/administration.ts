import { Component, inject, OnInit } from '@angular/core';
import { LucidePlus } from '@lucide/angular';
import { OrderTable } from '../../components/order-table';
import { RedFocusDirective } from '@core';
import { RouterLink } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardContent } from '@angular/material/card';
import { Store } from '@ngrx/store';
import {
  AppStateRoot,
  CartActions,
  selectIsAdmin,
  selectUser,
  UserStateRoot,
} from '@ngrx';

@Component({
  selector: 'app-administration',
  imports: [
    RouterLink,
    LucidePlus,
    OrderTable,
    RedFocusDirective,
    TranslocoDirective,
    MatButton,
    MatCard,
    MatCardContent,
  ],
  templateUrl: './administration.html',
  styleUrl: './administration.css',
})
export class Administration implements OnInit {
  private readonly store = inject(Store<AppStateRoot & UserStateRoot>);

  readonly user = this.store.selectSignal(selectUser);
  readonly isAdmin = this.store.selectSignal(selectIsAdmin);

  ngOnInit() {
    if (this.isAdmin()) {
      const userId = this.user()?.id;
      if (userId) {
        this.store.dispatch(CartActions.reloadOrders({ userId }));
      }
    }
  }

  openCreateModal() {
    // do nothing
  }
}
