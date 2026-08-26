import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  Query,
  Patch,
  Request,
  UseGuards,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import type { RequestWithUser } from '@book-store-2026/libs';

const COOKIE_NAME = 'access_token';
const COOKIE_MAX_AGE = 60 * 60 * 1000; // 1 hour

function authCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env['NODE_ENV'] === 'production',
    path: '/',
    maxAge: COOKIE_MAX_AGE,
  };
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, access_token } = await this.authService.login(loginDto);
    res.cookie(COOKIE_NAME, access_token, authCookieOptions());
    return { user };
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() body: { email: string; username: string; password: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user } = await this.authService.register(body);
    // Auto-login: sign a token and set cookie so user is immediately authenticated
    const access_token = await this.authService.signToken(user);
    res.cookie(COOKIE_NAME, access_token, authCookieOptions());
    return { user };
  }

  @UseGuards(JwtAuthGuard)
  @Get('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Request() req: RequestWithUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    res.clearCookie(COOKIE_NAME, { path: '/' });
    return this.authService.logout(req.user.username);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getUser(@Query('username') username: string) {
    return this.authService.findByUsername(username);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('favorites')
  async updateFavorites(
    @Request() req: RequestWithUser,
    @Body() body: { favorites: string[] },
  ) {
    return this.authService.updateFavorites(req.user.username, body.favorites);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('update')
  async updateProfile(
    @Request() req: RequestWithUser,
    @Body()
    body: {
      updates: {
        email?: string;
        phoneNumber?: string;
        theme?: string;
      };
    },
  ) {
    return this.authService.updateProfile(req.user.username, body.updates);
  }
}
