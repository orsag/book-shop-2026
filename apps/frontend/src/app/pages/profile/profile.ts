import {
  Component,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { form, FormField, required } from '@angular/forms/signals';
import { UserWithoutId, UserDetailSmall, User } from '@store/shared-models';
import { AppStore } from '../../store/app-store';
import { FormsModule } from '@angular/forms';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import {
  BehaviorSubject,
  combineLatest,
  distinctUntilChanged,
  map,
  of,
  switchMap,
} from 'rxjs';
import {
  LucideLock,
  LucideCreditCard,
  LucideClipboardCopy,
} from '@lucide/angular';
import { OrderService } from '../../services/order-service';
import { OrderStatus as OSEnum } from '@store/shared-models';
import { ToastService } from '../../services/toast-service';
import { NoFocusJumpDirective } from '../../core/no-focus-jump.directive';
import { CardSmall } from '../../components/card-small/card-small';
import { PremiumCard } from './premium-card';

@Component({
  selector: 'app-profile',
  imports: [
    CommonModule,
    FormsModule,
    DatePipe,
    FormField,
    CardSmall,
    LucideLock,
    LucideCreditCard,
    LucideClipboardCopy,
    NoFocusJumpDirective,
    CurrencyPipe,
    PremiumCard,
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {
  store = inject(AppStore);
  orderService = inject(OrderService);
  favorites = this.store.user()?.favorites;
  toast = inject(ToastService);
  private isFormInitialized = false;
  OrderStatus = OSEnum;
  favoriteProducts = this.store.favoriteProducts;

  constructor() {
    effect(() => {
      const latestDetail = this.store.userDetail();
      const id = this.store.user()?.id;

      if (id) {
        untracked(() => {
          // A. Trigger the fetch if we don't have data yet
          if (!latestDetail) {
            this.store.loadUserDetail({ userId: id });
            return; // Exit early; wait for the next run when data arrives
          }

          // B. Protective condition: Only set the model IF we haven't initialized yet
          if (!this.isFormInitialized && latestDetail) {
            //!this.detailForm().dirty()
            this.userDetailModel.set(this.mapToDetailModel(latestDetail));
            this.isFormInitialized = true; // Lock it down
          }
        });
      }
    });
  }

  userDetailModel = signal<UserDetailSmall>(
    this.mapToDetailModel(this.store.userDetail()),
  );

  userModel = signal<UserWithoutId>({
    username: this.store.user()?.username ?? '',
    email: this.store.user()?.email ?? '',
    phoneNumber: this.store.user()?.phoneNumber ?? '',
    theme: this.store.user()?.theme ?? 'light',
    // Move the nested fields into the userDetail object
  });

  detailForm = form(this.userDetailModel, (schemaPath) => {
    required(schemaPath.displayName, {
      message: 'Display name is required',
    });

    required(schemaPath.city, {
      message: 'City is required',
    });
  });

  userForm = form(this.userModel, (schemaPath) => {
    required(schemaPath.username, {
      message: 'Username is required',
    });
    required(schemaPath.email, {
      message: 'Email is required',
    });
    required(schemaPath.phoneNumber, {
      message: 'Phone is required',
    });
  });

  isPremium = computed(() => this.store.userDetail()?.isPremium ?? false);
  daysLeft = computed(() => {
    const end = this.store.userDetail()?.membershipEnd;
    if (!end) return 0;
    const diff = new Date(end).getTime() - Date.now();
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  });

  handleSave() {
    if (this.userForm().valid()) {
      const updatedData: Partial<User> = {
        ...this.userModel(),
      };

      this.store.updateUserProfile({ updates: updatedData });
    }
    if (this.detailForm().valid()) {
      const userId = this.store.user()?.id;
      const updatedData: Partial<UserDetailSmall> = {
        ...this.userDetailModel(),
      };
      if (userId) {
        this.store.updateUserDetail({ userId, updates: updatedData });
      }
    }
  }

  handleCancel() {
    this.userForm().reset();
    this.toast.success('Zmeny resetované');
  }

  private refreshOrders$ = new BehaviorSubject<void>(undefined);

  // New Signal for Order History
  orders = toSignal(
    combineLatest([
      toObservable(computed(() => this.store.user())).pipe(
        map((user) => user?.id),
        distinctUntilChanged(),
      ),
      this.refreshOrders$, // 2. This will fire whenever we call .next()
    ]).pipe(
      switchMap(([userId]) =>
        userId ? this.orderService.getUserOrders(userId) : of([]),
      ),
    ),
    { initialValue: [] },
  );

  // Logic to determine if an order can be cancelled (within 14 days)
  canCancel(createdAt: Date): boolean {
    const now = Date.now();
    const orderTime = new Date(createdAt).getTime();
    const fourteenDaysMs = 14 * 24 * 60 * 60 * 1000;
    return now - orderTime <= fourteenDaysMs;
  }

  handleCancelOrder(orderId: string) {
    this.orderService.cancelOrder(orderId).subscribe({
      next: () => {
        this.refreshOrders$.next();
        this.store.refreshUser();
        this.toast.success('Objednávka zrušená do 14 dní.');
      },
    });
  }

  // 1. Extract the mapping logic to a reusable method
  private mapToDetailModel(detail: any): UserDetailSmall {
    return {
      displayName: detail?.displayName ?? '',
      bio: detail?.bio ?? '',
      avatarUrl: detail?.avatarUrl ?? '',
      city: detail?.city ?? '',
      countryCode: detail?.countryCode ?? 'SK',
      preferredLanguage: detail?.preferredLanguage ?? 'en',
      addressLine1: detail?.addressLine1 ?? '',
      lastActiveAt: detail?.lastActiveAt ?? new Date(),
      addressLine2: detail?.addressLine2 ?? '',
      postalCode: detail?.postalCode ?? '',
      iban: detail?.iban ?? '',
      bic: detail?.bic ?? '',
      taxId: detail?.taxId ?? '',
      dateOfBirth: detail?.dateOfBirth
        ? new Date(detail.dateOfBirth).toISOString().split('T')[0]
        : null,
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
