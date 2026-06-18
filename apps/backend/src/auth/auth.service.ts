import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // Adjust path
import { LoginDto } from './dto/login.dto';
import { User } from '@store/libs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const username = loginDto.username.toLowerCase();
    const user: User | null = await this.prisma.client.user.findUnique({
      where: { username },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Create JWT Payload
    const payload = { sub: user.id, username: user.username };

    // Update last login and return the expected response
    const updatedUser = await this.prisma.client.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    return {
      user: updatedUser,
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async findByUsername(username: string) {
    const user = await this.prisma.client.user.findUnique({
      where: { username: username.toLowerCase() },
    });

    if (!user) {
      throw new NotFoundException(`User ${username} not found`);
    }
    return user;
  }

  async logout(username: string) {
    // Logic: Ensure the user actually exists before "logging out"
    const user = await this.prisma.client.user.findUnique({
      where: { username: username.toLowerCase() },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Optional: You could update a field like `lastActive` here
    this.prisma.client.user.update({
      where: { username: username.toLowerCase() },
      data: {
        lastLogin: new Date(),
      }
    });

    return {
      message: `User ${username} logged out successfully`,
      timestamp: new Date(),
    };
  }

  async updateFavorites(username: string, favorites: string[]) {
    return this.prisma.client.user.update({
      where: { username: username.toLowerCase() },
      data: { favorites: favorites }, // Postgres native array magic
    });
  }

  async updateProfile(
    username: string,
    updates: { email?: string; phoneNumber?: string; theme?: string },
  ) {
    return this.prisma.client.user.update({
      where: { username: username.toLowerCase() },
      data: {
        email: updates.email,
        phoneNumber: updates.phoneNumber,
        theme: updates.theme,
        // isAdmin and favorites are NEVER touched here
      },
    });
  }
}
