import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { loadAuthConfig } from '../config/auth.config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      useFactory: () => {
        const { jwtSecret, jwtExpiresIn } = loadAuthConfig();
        return {
          secret: jwtSecret,
          signOptions: { expiresIn: jwtExpiresIn },
        };
      },
    }),
    TypeOrmModule.forFeature([User]),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [PassportModule, JwtModule],
})
export class AuthModule {}
