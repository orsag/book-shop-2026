// src/services/auth.service.ts
import jwt from 'jsonwebtoken';
import { prisma } from '@prismalib'; // Direct import from your library[cite: 4]
import { LoginDto } from '../dto/login.dto'; // Ensure this matches your project relative paths

export class AuthService {
  private readonly jwtSecret: string;

  constructor() {
    const secret = process.env['JWT_SECRET'];
    if (!secret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }
    this.jwtSecret = secret;
  }

  async login(loginDto: LoginDto) {
    const username = loginDto.username.toLowerCase();

    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      // Throwing standard errors we can catch in a global handler or controller
      throw new Error('Invalid credentials');
    }

    // Create JWT Payload matching your AuthenticatedUser configuration[cite: 11, 12]
    const payload = {
      sub: user.id,
      username: user.username,
      isAdmin: user.isAdmin // Ensure matches your JwtPayload specification[cite: 11, 12]
    };

    // Update last login[cite: 11]
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Sign the token using standard jsonwebtoken library
    const token = jwt.sign(payload, this.jwtSecret, {
      algorithm: 'HS256',
      expiresIn: '1d', // Or configure as desired
    });

    return {
      user: updatedUser,
      access_token: token,
    };
  }

  async findByUsername(username: string) {
    const user = await prisma.user.findUnique({
      where: { username: username.toLowerCase() },
    });

    if (!user) {
      throw new Error(`User ${username} not found`);
    }
    return user;
  }

  async logout(username: string) {
    const user = await prisma.user.findUnique({
      where: { username: username.toLowerCase() },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Optional fire-and-forget: update last login on logout[cite: 11]
    await prisma.user.update({
      where: { username: username.toLowerCase() },
      data: {
        lastLogin: new Date(),
      },
    });

    return {
      message: `User ${username} logged out successfully`,
      timestamp: new Date(),
    };
  }

  async updateFavorites(username: string, favorites: string[]) {
    return prisma.user.update({
      where: { username: username.toLowerCase() },
      data: { favorites: favorites },
    });
  }

  async updateProfile(
    username: string,
    updates: { email?: string; phoneNumber?: string; theme?: string },
  ) {
    return prisma.user.update({
      where: { username: username.toLowerCase() },
      data: {
        email: updates.email,
        phoneNumber: updates.phoneNumber,
        theme: updates.theme,
      },
    });
  }
}