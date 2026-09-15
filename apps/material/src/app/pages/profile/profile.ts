import { Component, effect, inject, signal, untracked } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { form, FormField, required } from '@angular/forms/signals';
import {
  UpdateUserDtoSmall,
  UserDetailSmall,
  OrderStatus,
  OrderStatus as OSEnum,
} from '@store/shared-models';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { MatButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import {
  MatFormField,
  MatLabel,
  MatPrefix,
  MatSuffix,
  MatError,
} from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import {
  LucideLock,
  LucideCreditCard,
  LucideClipboardCopy,
  LucideShoppingBag,
} from '@lucide/angular';
import { ConfigurationService, OrderService, ToastService } from '@service';
import { delay } from 'rxjs';
import { UpdateUserDetailDto } from '@api';
import {
  AppStateRoot,
  CartActions,
  CartStateRoot,
  selectFavoriteCount,
  selectFavoriteProducts,
  selectOrders,
  selectUser,
  selectUserDetail,
  UserActions,
  UserStateRoot,
} from '@ngrx';

@Component({
  selector: 'app-profile',
  imports: [
    CommonModule,
    DatePipe,
    CurrencyPipe,
    FormField,
    RouterLink,
    MatButton,
    MatCard,
    MatFormField,
    MatLabel,
    MatPrefix,
    MatSuffix,
    MatError,
    MatInput,
    LucideLock,
    LucideCreditCard,
    LucideClipboardCopy,
    LucideShoppingBag,
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {
  private readonly store = inject(
    Store<AppStateRoot & CartStateRoot & UserStateRoot>,
  );
  orderService = inject(OrderService);
  toast = inject(ToastService);
  config = inject(ConfigurationService);
  private isFormInitialized = false;
  OrderStatus = OSEnum;
  private detailSnapshot = signal<UserDetailSmall | undefined>(undefined);
  private userSnapshot = signal<UpdateUserDtoSmall | undefined>(undefined);

  readonly user = this.store.selectSignal(selectUser);
  readonly userDetail = this.store.selectSignal(selectUserDetail);
  readonly orders = this.store.selectSignal(selectOrders);
  readonly favoriteProducts = this.store.selectSignal(selectFavoriteProducts);
  readonly favoriteCount = this.store.selectSignal(selectFavoriteCount);

  constructor() {
    effect(() => {
      const latestDetail = this.userDetail();
      const id = this.user()?.id;

      if (id) {
        untracked(() => {
          this.store.dispatch(CartActions.reloadOrders({ userId: id }));

          if (!latestDetail) {
            this.store.dispatch(UserActions.loadUserDetail({ userId: id }));
            return; // Wait for the next run when data arrives
          }

          if (!this.isFormInitialized && latestDetail) {
            this.userDetailModel.set(this.mapToDetailModel(latestDetail));
            this.isFormInitialized = true;
            this.detailSnapshot.set(this.mapToDetailModel(latestDetail));
            this.userSnapshot.set({
              username: this.user()?.username ?? '',
              email: this.user()?.email ?? '',
              phoneNumber: this.user()?.phoneNumber ?? '',
              theme: this.user()?.theme ?? 'light',
            });
          }
        });
      }
    });

    effect(() => {
      const isDirty = this.form().dirty() || this.userForm().dirty();
      untracked(() => {
        this.store.dispatch(
          UserActions.updateStore({ key: 'isDirtyForm', value: isDirty }),
        );
      });
    });
  }

  userDetailModel = signal<UserDetailSmall>(
    this.mapToDetailModel(this.userDetail()),
  );

  userModel = signal<UpdateUserDtoSmall>({
    username: this.user()?.username ?? '',
    email: this.user()?.email ?? '',
    phoneNumber: this.user()?.phoneNumber ?? '',
    theme: this.user()?.theme ?? 'light',
  });

  form = form(this.userDetailModel, (schemaPath) => {
    required(schemaPath.displayName, {
      message: 'Display name is required',
    });
    required(schemaPath.city, {
      message: 'City is required',
    });
    required(schemaPath.addressLine1, {
      message: 'Street is required',
    });
    required(schemaPath.iban, {
      message: 'Iban is required',
    });
  });

  userForm = form(this.userModel, (schemaPath) => {
    required(schemaPath.email, {
      message: 'Email is required',
    });
    required(schemaPath.phoneNumber, {
      message: 'Phone number is required',
    });
  });

  handleSave() {
    if (this.form().valid() && this.userForm().valid()) {
      const userId = this.user()?.id;
      const updatedData: Partial<UserDetailSmall> = {
        ...this.userDetailModel(),
      };
      if (userId) {
        this.store.dispatch(
          UserActions.updateUserDetail({ userId, updates: updatedData }),
        );
        this.form().reset();
        this.userForm().reset();
      }
    } else {
      this.handleNextInvalidField();
    }
  }

  handleNextInvalidField() {
    const fields = [
      this.userForm.email,
      this.userForm.phoneNumber,
      this.form.bio,
      this.form.city,
      this.form.addressLine1,
      this.form.iban,
      this.form.taxId,
      this.form.dateOfBirth,
    ];

    const invalidField = fields.find((field) => field && field().invalid());

    if (invalidField) {
      invalidField().focusBoundControl();
    }
  }

  handleReset() {
    const us = this.userSnapshot();
    const ds = this.detailSnapshot();
    if (us && ds) {
      this.userForm().reset(us);
      this.form().reset(ds);
      this.toast.success('Zmeny resetované');
    }

    this.form().focusBoundControl();
  }

  handleCancelOrder(orderId: string) {
    this.store.dispatch(
      CartActions.updateOrderLocal({
        id: orderId,
        status: 'CANCELLED' as OrderStatus,
      }),
    );

    this.orderService
      .cancelOrder(orderId)
      .pipe(delay(500))
      .subscribe({
        next: () => {
          this.toast.success('Status updated');
          this.store.dispatch(UserActions.refreshUser());
        },
      });
  }

  canCancel(createdAt: Date): boolean {
    const now = Date.now();
    const orderTime = new Date(createdAt).getTime();
    const fourteenDaysMs = 14 * 24 * 60 * 60 * 1000;
    return now - orderTime <= fourteenDaysMs;
  }

  private mapToDetailModel(
    detail: UpdateUserDetailDto | null,
  ): UserDetailSmall {
    return {
      displayName: detail?.displayName ?? '',
      bio: detail?.bio ?? '',
      avatarUrl: detail?.avatarUrl ?? '',
      city: detail?.city ?? '',
      countryCode: detail?.countryCode ?? 'SK',
      preferredLanguage: detail?.preferredLanguage ?? 'en',
      addressLine1: detail?.addressLine1 ?? '',
      addressLine2: detail?.addressLine2 ?? '',
      postalCode: detail?.postalCode ?? '',
      iban: detail?.iban ?? '',
      bic: detail?.bic ?? '',
      taxId: detail?.taxId ?? '',
      dateOfBirth: detail?.dateOfBirth
        ? new Date(detail.dateOfBirth).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
    };
  }

  copyToClipboard(id: string) {
    navigator.clipboard
      .writeText(id)
      .then(() => {
        this.toast.success('Skopírované');
      })
      .catch(() => {
        this.toast.alert('Skopírovanie zlyhalo');
      });
  }
}