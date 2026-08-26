import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { JwtPayload, AuthenticatedUser } from './types';
import type { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req?.cookies?.['access_token'],
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env['JWT_SECRET'] || 'fallback-secret-key',
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    return {
      userId: payload.sub,
      email: payload.email,
      username: payload.username,
      isAdmin: payload.isAdmin,
    };
  }
}
