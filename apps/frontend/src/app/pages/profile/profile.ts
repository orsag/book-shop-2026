import {
  Component,
  computed,
  effect,
  inject,
  OnInit,
  signal,
  untracked,
} from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { form, FormField, required } from '@angular/forms/signals';
import {
  UserWithoutId,
  UserDetailSmall,
  User,
  OrderStatus,
  UserDetail,
} from '@store/shared-models';
import { AppStore } from '../../store/app-store';
import { FormsModule } from '@angular/forms';
import {
  LucideLock,
  LucideCreditCard,
  LucideClipboardCopy,
  LucideShoppingBag
} from '@lucide/angular';
import { OrderService } from '../../services/order-service';
import { OrderStatus as OSEnum } from '@store/shared-models';
import { ToastService } from '../../services/toast-service';
import { NoFocusJumpDirective } from '../../core/no-focus-jump.directive';
import { CardSmall } from '../../components/card-small/card-small';
import { delay } from 'rxjs';
import { UserStore } from '../../store/user-store';
import { CartStore } from '../../store/cart-store';

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
    LucideShoppingBag,
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  store = inject(AppStore);
  userStore = inject(UserStore);
  cartStore = inject(CartStore);
  orderService = inject(OrderService);
  favorites = this.userStore.user()?.favorites;
  toast = inject(ToastService);
  private isFormInitialized = false;
  OrderStatus = OSEnum;

  ngOnInit() {
    const userId = this.userStore.user()?.id;
    if (userId) {
      this.userStore.loadUserDetail({ userId });
      this.cartStore.reloadOrders({ userId });
    }
  }

  constructor() {
    effect(() => {
      const latestDetail = this.userStore.userDetail();
      const id = this.userStore.user()?.id;

      if (id) {
        untracked(() => {
          // A. Trigger the fetch if we don't have data yet
          if (!latestDetail) {
            this.userStore.loadUserDetail({ userId: id });
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

  // 5. Update handleCancelOrder to use the new method
  handleCancelOrder(orderId: string) {
    this.cartStore.updateOrderLocal(orderId, 'CANCELLED' as OrderStatus);

    this.orderService
      .cancelOrder(orderId)
      .pipe(delay(500))
      .subscribe({
        next: () => {
          this.toast.success('Status updated');
          this.userStore.refreshUser();
        },
      });
  }

  userDetailModel = signal<UserDetailSmall>(
    this.mapToDetailModel(this.userStore.userDetail()),
  );

  userModel = signal<UserWithoutId>({
    username: this.userStore.user()?.username ?? '',
    email: this.userStore.user()?.email ?? '',
    phoneNumber: this.userStore.user()?.phoneNumber ?? '',
    theme: this.userStore.user()?.theme ?? 'light',
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

  isPremium = computed(() => this.userStore.userDetail()?.isPremium ?? false);
  daysLeft = computed(() => {
    const end = this.userStore.userDetail()?.membershipEnd;
    if (!end) return 0;
    const diff = new Date(end).getTime() - Date.now();
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  });

  handleSave() {
    if (this.userForm().valid()) {
      const updatedData: Partial<User> = {
        ...this.userModel(),
      };
    }
    if (this.detailForm().valid()) {
      const userId = this.userStore.user()?.id;
      const updatedData: Partial<UserDetailSmall> = {
        ...this.userDetailModel(),
      };
      if (userId) {
        this.userStore.updateUserDetail({ userId, updates: updatedData });
      }
    }
  }

  handleCancel() {
    this.userForm().reset();
    this.toast.success('Zmeny resetované');
  }

  // Logic to determine if an order can be cancelled (within 14 days)
  canCancel(createdAt: Date): boolean {
    const now = Date.now();
    const orderTime = new Date(createdAt).getTime();
    const fourteenDaysMs = 14 * 24 * 60 * 60 * 1000;
    return now - orderTime <= fourteenDaysMs;
  }

  // 1. Extract the mapping logic to a reusable method
  private mapToDetailModel(detail: UserDetail | null): UserDetailSmall {
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
