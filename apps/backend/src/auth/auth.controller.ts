import { Controller, Post, Get, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CurrentUser } from './current-user.decorator';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import type { JwtPayload } from './jwt.strategy';
import type { RegisterResult, LoginResult } from './auth.service';

interface MeResponse {
  id: string;
  email: string;
  role: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto): Promise<RegisterResult> {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto): Promise<LoginResult> {
    return this.authService.login(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: JwtPayload): MeResponse {
    return { id: user.sub, email: user.email, role: user.role };
  }
}
