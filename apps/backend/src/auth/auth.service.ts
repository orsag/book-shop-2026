import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const hash = await bcrypt.hash(dto.password, 10);
    try {
      const user: any = await this.prisma.client.user.create({
        data: { email: dto.email, username: dto.username, password: hash },
      });
      delete user.password;
      return user;
    } catch (err) {
      throw new ConflictException('Username or email already exists');
    }
  }

  async login(dto: LoginDto) {
    const username = dto.username.toLowerCase();
    const user = await this.prisma.client.user.findUnique({
      where: { username },
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      isAdmin: user.isAdmin,
    };

    const { password, ...result } = user;
    return {
      user: result,
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async findByUsername(username: string) {
    const user: any = await this.prisma.client.user.findUnique({
      where: { username: username.toLowerCase() },
    });

    if (!user) {
      throw new NotFoundException(`User ${username} not found`);
    }
    delete user.password;
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
      },
    });

    return {
      message: `User ${username} logged out successfully`,
      timestamp: new Date(),
    };
  }

  async updateFavorites(username: string, favorites: string[]) {
    const updatedUser: any = await this.prisma.client.user.update({
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
    const updatedUser: any = this.prisma.client.user.update({
      where: { username: username.toLowerCase() },
      data: {
        email: updates.email,
        phoneNumber: updates.phoneNumber,
        theme: updates.theme,
        // isAdmin and favorites are NEVER touched here
      },
    });
    const { password, ...result } = updatedUser;
    return result;
  }
}
