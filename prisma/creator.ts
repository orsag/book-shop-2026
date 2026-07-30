import 'dotenv/config';
import * as bcrypt from 'bcryptjs';
import {
  DEFAULT_EMAIL,
  DEFAULT_AVATAR,
  DEFAULT_TEST_EMAIL,
} from './creator.constants';
import { faker } from '@faker-js/faker';

// @ts-ignore
const username = `${process.env['USERNAME']}`;
// @ts-ignore
const rawPassword = `${process.env['PASSWORD']}`;
// @ts-ignore
const testUserName = `${process.env['TEST_NAME']}`;
// @ts-ignore
const testUserPassword = `${process.env['TEST_PASSWORD']}`;

export async function createAdmin() {
  // Hashes dynamically without top-level await!
  const hashedPassword = await bcrypt.hash(rawPassword, 10);

  return {
    username: username,
    email: DEFAULT_EMAIL,
    password: hashedPassword,
    isAdmin: true,
    phoneNumber: '+421900000000',
    avatarUrl: DEFAULT_AVATAR,
    theme: 'light',
    favorites: [] as string[],
    cartItems: [] as any[],
  };
}

export async function createTestUser() {
  // Hashes dynamically without top-level await!
  const hashedPassword = await bcrypt.hash(testUserPassword, 10);

  return {
    username: testUserName,
    email: DEFAULT_TEST_EMAIL,
    password: hashedPassword,
    isAdmin: true,
    phoneNumber: '+421900123456',
    avatarUrl: DEFAULT_AVATAR,
    theme: 'light',
    favorites: [] as string[],
    cartItems: [] as any[],
  };
}

export function createUserDetail(userId: string) {
  return {
    userId: userId,
    isPremium: true,
    membershipStart: faker.date.past({ years: 1 }),
    membershipEnd: faker.date.future({ years: 1 }),
    displayName: faker.person.fullName(),
    addressLine1: faker.location.streetAddress(),
    city: faker.location.city(),
    countryCode: 'SK',
    avatarUrl: faker.image.avatar(),
    bio: faker.person.bio(),
    iban: faker.finance.iban(),
    dateOfBirth: faker.date.birthdate(),
    lastActiveAt: faker.date.past({ years: 1 }),
  };
}
