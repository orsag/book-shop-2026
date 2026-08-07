import { CreateUserDetailDto, CreateUserDto } from '@api';

export interface User extends Omit<CreateUserDto, 'password'> {
  id: string;
  lastLogin: Date;
  cartItems: string[];
}

// Define the shape of your JWT payload
export interface RequestWithUser {
  user: {
    userId: string;
    username: string;
    isAdmin: boolean;
  };
}

export type UpdateUserDtoSmall = Required<
  Omit<
    CreateUserDto,
    'password' | 'isAdmin' | 'favorites' | 'cartItems' | 'avatarUrl'
  >
>;

export type UserDetailSmall = Required<
  Omit<
    CreateUserDetailDto,
    | 'id'
    | 'userId'
    | 'createdAt'
    | 'updatedAt'
    | 'stateProvince'
    | 'isPremium'
    | 'membershipStart'
    | 'membershipEnd'
    | 'lastActiveAt'
  >
>;

// export type UserDetailSmall = Omit<
//   CreateUserDetailDto,
//   | 'id'
//   | 'userId'
//   | 'createdAt'
//   | 'updatedAt'
//   | 'stateProvince'
//   | 'isPremium'
//   | 'membershipStart'
//   | 'membershipEnd'
//   | 'lastActiveAt'
// > & {
//   preferredLanguage: string;
//   displayName: string;
//   city: string;
//   bio: string;
//   avatarUrl: string;
//   addressLine2: string;
//   postalCode: string;
//   iban: string;
//   bic: string;
//   taxId: string;
// };

// export interface UserDetail {
//   id: string;
//   userId: string;
//
//   // Personalization
//   displayName: string | null;
//   avatarUrl: string | null;
//   bio: string | null;
//   preferredLanguage: string; // default: "en"
//
//   // Membership
//   isPremium: boolean; // default: false
//   membershipStart: Date | string | null;
//   membershipEnd: Date | string | null;
//
//   // Normalized Address Fields
//   addressLine1: string;
//   addressLine2: string | null;
//   city: string;
//   stateProvince: string | null;
//   postalCode: string | null;
//   countryCode: string; // ISO 3166-1 alpha-2
//
//   // Banking
//   iban: string | null;
//   bic: string | null;
//   dateOfBirth: Date | string | null;
//   taxId: string | null;
//
//   lastActiveAt: Date | string;
//
//   createdAt: Date | string;
//   updatedAt: Date | string;
// }

export interface PremiumStatus {
  isPremium: boolean;
  membershipStart: Date | null;
  membershipEnd: Date | null;
}
