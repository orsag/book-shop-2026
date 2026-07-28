import 'dotenv/config';
import * as bcrypt from 'bcryptjs';
import {
  DEFAULT_EMAIL,
  DEFAULT_AVATAR,
} from './creator.constants';

// @ts-ignore
const username = `${process.env['USERNAME']}`;
// @ts-ignore
const rawPassword = `${process.env['PASSWORD']}`;

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
