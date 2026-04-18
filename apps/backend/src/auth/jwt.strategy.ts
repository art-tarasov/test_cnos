import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { loadAuthConfig } from '../config/auth.config';
import type { UserRole } from '../entities/user.entity';

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    const { jwtSecret } = loadAuthConfig();
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  validate(payload: JwtPayload): JwtPayload {
    return payload;
  }
}
