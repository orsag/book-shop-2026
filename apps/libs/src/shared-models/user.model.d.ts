export interface User {
    id: string;
    username: string;
    email: string;
    isAdmin: boolean;
    avatarUrl: string;
    phoneNumber: string;
    theme: string;
    favorites: string[];
    lastLogin?: Date;
    cartItems: string[];
    createdAt: Date;
    updatedAt: Date;
}
export type CreateUserDto = Omit<User, 'id'>;
export type UserWithoutId = Omit<User, 'id' | 'favorites' | 'isAdmin' | 'lastLogin' | 'cartItems' | 'createdAt' | 'updatedAt' | 'avatarUrl'>;
export type UserDetailSmall = Omit<UserDetail, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'stateProvince' | 'isPremium' | 'membershipStart' | 'membershipEnd'> & {
    displayName: string;
    city: string;
    bio: string;
    avatarUrl: string;
    addressLine2: string;
    postalCode: string;
    iban: string;
    bic: string;
    taxId: string;
};
export interface UserDetail {
    id: string;
    userId: string;
    displayName: string | null;
    avatarUrl: string | null;
    bio: string | null;
    preferredLanguage: string;
    isPremium: boolean;
    membershipStart: Date | string | null;
    membershipEnd: Date | string | null;
    addressLine1: string;
    addressLine2: string | null;
    city: string;
    stateProvince: string | null;
    postalCode: string | null;
    countryCode: string;
    iban: string | null;
    bic: string | null;
    dateOfBirth: Date | string | null;
    taxId: string | null;
    lastActiveAt: Date | string;
    createdAt: Date | string;
    updatedAt: Date | string;
}
export interface PremiumStatus {
    isPremium: boolean;
    membershipStart: Date | null;
    membershipEnd: Date | null;
}
export declare const EMPTY_USER: UserWithoutId;
