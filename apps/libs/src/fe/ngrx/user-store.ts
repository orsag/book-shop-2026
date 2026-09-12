import { createActionGroup, createReducer, createSelector, emptyProps, on, props } from '@ngrx/store';
import { PremiumStatus, User, UserDetailSmall } from '@store/libs';
import { CreateUserDetailDto } from '@api';

// Keys for LocalStorage
export const USER_STORAGE_KEY = 'currentUser';
export const DETAIL_STORAGE_KEY = 'currentStatus';

export const userFeatureKey = 'user';

export interface UserState {
  readonly user: User | null;
  readonly userDetail: CreateUserDetailDto | null;
  readonly premiumStatus: PremiumStatus | null;
  readonly isDirtyForm: boolean;
}

export interface UserStateRoot {
  [userFeatureKey]: UserState;
}

export const initialState: UserState = {
  user: null,
  userDetail: null,
  premiumStatus: null,
  isDirtyForm: false,
};

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------
export const UserActions = createActionGroup({
  source: 'User',
  events: {
    // --- 👤 UI Actions (Dispatched by Components) ---
    'Register': props<{
      credentials: { username: string; password: string; email: string };
    }>(),
    'Login': props<{ credentials: { username: string; password: string } }>(),
    'Logout': emptyProps(),
    'Update User Profile': props<{ updates: Partial<User> }>(),
    'Update User Detail': props<{
      userId: string;
      updates: Partial<UserDetailSmall>;
    }>(),
    'Load User Detail': props<{ userId: string }>(),
    'Refresh User': emptyProps(),
    'Toggle Favorite': props<{ productId: string }>(),
    'Invalidate User': emptyProps(),
    'Update Store': props<{ key: keyof UserState; value: UserState[keyof UserState] }>(),
    // --- ✅ Result Actions (Dispatched by Effects) ---
    'Register Success': props<{ user: User }>(),
    'Login Success': props<{ user: User; premiumStatus: PremiumStatus | null }>(),
    'User Profile Updated': props<{ user: User }>(),
    'User Detail Updated': props<{ userDetail: CreateUserDetailDto }>(),
    'User Detail Loaded': props<{ userDetail: CreateUserDetailDto }>(),
    'User Refreshed': props<{ user: User }>(),
  },
});

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------
export const userReducer = createReducer(
  initialState,

  on(UserActions.registerSuccess, (state, { user }) => ({
    ...state,
    user,
  })),

  on(UserActions.loginSuccess, (state, { user, premiumStatus }) => ({
    ...state,
    user,
    premiumStatus,
  })),

  on(UserActions.logout, () => ({
    ...initialState,
  })),

  on(UserActions.userProfileUpdated, (state, { user }) => ({
    ...state,
    user,
  })),

  on(UserActions.userDetailUpdated, (state, { userDetail }) => ({
    ...state,
    userDetail,
  })),

  on(UserActions.userDetailLoaded, (state, { userDetail }) => ({
    ...state,
    userDetail,
  })),

  on(UserActions.userRefreshed, (state, { user }) => ({
    ...state,
    user,
  })),

  on(UserActions.invalidateUser, () => ({
    ...initialState,
  })),

  on(UserActions.toggleFavorite, (state, { productId }) => {
    if (!state.user) return state;

    // Calculate new favorites array locally (optimistic update)
    const isFavorite = state.user.favorites?.includes(productId);
    const oldArray = state.user.favorites ? [...state.user.favorites] : [];

    const updatedFavorites = isFavorite
      ? state.user.favorites?.filter((id) => id !== productId)
      : [...oldArray, productId];

    return {
      ...state,
      user: { ...state.user, favorites: updatedFavorites },
    };
  }),

  on(UserActions.updateStore, (state, { key, value }) => ({
    ...state,
    [key]: value,
  }) as UserState),
);

// ---------------------------------------------------------------------------
// Selectors
// ---------------------------------------------------------------------------
export const selectUserState = (state: UserStateRoot): UserState =>
  state[userFeatureKey];

export const selectUser = createSelector(
  selectUserState,
  (state) => state.user,
);

export const selectUserDetail = createSelector(
  selectUserState,
  (state) => state.userDetail,
);

export const selectPremiumStatus = createSelector(
  selectUserState,
  (state) => state.premiumStatus,
);

export const selectIsDirtyForm = createSelector(
  selectUserState,
  (state) => state.isDirtyForm,
);

export const selectIsLoggedIn = createSelector(
  selectUser,
  (user) => !!user,
);

export const selectIsAdmin = createSelector(
  selectUser,
  (user) => user?.isAdmin ?? false,
);

export const selectIsPremium = createSelector(
  selectPremiumStatus,
  (premiumStatus) => premiumStatus?.isPremium ?? false,
);

export const selectFavoriteCount = createSelector(
  selectUser,
  (user) => user?.favorites?.length ?? 0,
);

export const selectCartCount = createSelector(
  selectUser,
  (user) => user?.cartItems?.length ?? 0,
);