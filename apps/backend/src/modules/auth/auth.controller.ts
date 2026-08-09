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
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import type { RequestWithUser } from '@store/libs';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard) // Protects this specific route
  @Get('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Request() req: RequestWithUser) {
    // req.user is now available thanks to the guard
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
