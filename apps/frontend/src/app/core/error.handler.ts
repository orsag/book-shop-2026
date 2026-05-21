import { Injectable, inject } from '@angular/core';
import { ToastService } from '../services/toast-service';

// Define your error codes as a const object for better type inference
export const ErrorCodes = {
  FETCH_BOOKS: 'AUTH_001',
  PREMIUM: 'PREMIUM',
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  REFRESH: 'REFRESH',
  TOGGLE_FAVORITE: 'TOGGLE_FAVORITE',
  UPDATE_PROFILE: 'UPDATE_PROFILE',
  LOAD_PROFILE: 'LOAD_PROFILE',
  PRODUCT_UPDATE: 'PRODUCT_UPDATE',
  PRODUCT_CREATE: 'PRODUCT_CREATE',
  PRODUCT_DELETE: 'PRODUCT_DELETE',
  CHECKOUT: 'CHECKOUT',
  NOT_FOUND: 'REQ_404',
  FORCE_LOGOUT: 'FORCE_LOGOUT',
} as const;

export const SuccessCodes = {
  PREMIUM: 'PREMIUM',
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  REFRESH: 'REFRESH',
  UPDATE_PROFILE: 'UPDATE_PROFILE',
  LOAD_PROFILE: 'LOAD_PROFILE',
  PRODUCT_UPDATE: 'PRODUCT_UPDATE',
  PRODUCT_CREATE: 'PRODUCT_CREATE',
  PRODUCT_DELETE: 'PRODUCT_DELETE',
  BOOK_SAVE: 'BOOK_SAVE',
  CHECKOUT: 'CHECKOUT',
} as const;

// Map the codes to user-friendly messages
const ErrorMessages: Record<string, string> = {
  [ErrorCodes.FETCH_BOOKS]: 'Failed to load books',
  [ErrorCodes.PREMIUM]: 'Premium check failed',
  [ErrorCodes.LOGIN]: 'Login failed',
  [ErrorCodes.LOGOUT]: 'Logout failed',
  [ErrorCodes.REFRESH]: 'Refresh failed',
  [ErrorCodes.TOGGLE_FAVORITE]: 'Toggle Favorite failed',
  [ErrorCodes.UPDATE_PROFILE]: 'Update profile failed',
  [ErrorCodes.LOAD_PROFILE]: 'Load profile failed',
  [ErrorCodes.NOT_FOUND]: 'The requested resource was not found.',
  [ErrorCodes.PRODUCT_UPDATE]: 'Product update failed',
  [ErrorCodes.PRODUCT_CREATE]: 'Product create failed',
  [ErrorCodes.PRODUCT_DELETE]: 'Product delete failed',
  [ErrorCodes.CHECKOUT]: 'Checkout failed',
  [ErrorCodes.FORCE_LOGOUT]: 'User was logged out.',
};

const SuccessMessages: Record<string, string> = {
  [SuccessCodes.LOGIN]: 'Login successful',
  [SuccessCodes.LOGOUT]: 'Logout successful',
  [SuccessCodes.REFRESH]: 'Refresh successful',
  [SuccessCodes.UPDATE_PROFILE]: 'Update profile successful',
  [SuccessCodes.LOAD_PROFILE]: 'Load profile successful',
  [SuccessCodes.PRODUCT_UPDATE]: 'Product update successful',
  [SuccessCodes.PRODUCT_CREATE]: 'Product create successful',
  [SuccessCodes.PRODUCT_DELETE]: 'Product delete successful',
  [SuccessCodes.BOOK_SAVE]: 'Book save LC successful',
  [SuccessCodes.CHECKOUT]: 'Order created successful ',
};

const DEFAULT_ERROR_MESSAGE = 'An unexpected error occurred.';
const DEFAULT_SUCCESS_MESSAGE = 'Successfully received a response.';

@Injectable({ providedIn: 'root' })
export class ErrorService {
  private toast = inject(ToastService);

  handleError(errorCode: string | null | undefined): void {
    const message = ErrorMessages[errorCode ?? ''] || DEFAULT_ERROR_MESSAGE;
    this.toast.alert(message);
  }

  handleSuccess(successCode: string | null | undefined): void {
    const message =
      SuccessMessages[successCode ?? ''] || DEFAULT_SUCCESS_MESSAGE;
    this.toast.success(message);
  }
}
