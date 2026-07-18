// src/services/auth.service.ts
import jwt from 'jsonwebtoken';
import { prisma } from '@prismalib';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import * as bcrypt from 'bcryptjs';

export class AuthService {
  private readonly jwtSecret: string;

  constructor() {
    const secret = process.env['JWT_SECRET'];
    if (!secret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }
    this.jwtSecret = secret;
  }

  async register(dto: RegisterDto) {
    const hash = await bcrypt.hash(dto.password, 10);
    try {
      const user = await prisma.user.create({
        data: { email: dto.email, username: dto.username, password: hash },
      });
      const { password, ...result } = user;
      return result;
    } catch (err) {
      throw new Error('Username or email already exists');
    }
  }

  async login(dto: LoginDto) {
    const username = dto.username.toLowerCase();

    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    // Create JWT Payload
    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      isAdmin: user.isAdmin,
    };

    // Sign the token using standard jsonwebtoken library
    const token = jwt.sign(payload, this.jwtSecret, {
      algorithm: 'HS256',
      expiresIn: '1d', // Or configure as desired
    });

    const { password, ...result } = user;

    return {
      user: result,
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
    const { password, ...result } = user;
    return result;
  }

  async logout(username: string) {
    const user = await prisma.user.findUnique({
      where: { username: username.toLowerCase() },
    });

    if (!user) {
      throw new Error('User not found');
    }

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
    const updatedUser: any = prisma.user.update({
      where: { username: username.toLowerCase() },
      data: { favorites: favorites },
    });
    const { password, ...result } = updatedUser;
    return result;
  }

  async updateProfile(
    username: string,
    updates: { email?: string; phoneNumber?: string; theme?: string },
  ) {
    const updatedUser:any = prisma.user.update({
      where: { username: username.toLowerCase() },
      data: {
        email: updates.email,
        phoneNumber: updates.phoneNumber,
        theme: updates.theme,
      },
    });
    const { password, ...result } = updatedUser;
    return result;
  }
}