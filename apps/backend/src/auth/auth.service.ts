import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../entities/user.entity';
import type { RegisterDto } from './dto/register.dto';
import type { LoginDto } from './dto/login.dto';
import type { JwtPayload } from './jwt.strategy';

const BCRYPT_ROUNDS = 12;

export interface RegisterResult {
  id: string;
  email: string;
  role: UserRole;
}

export interface LoginResult {
  access_token: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<RegisterResult> {
    const existing = await this.users.findOne({ where: { email: dto.email } });
    if (existing !== null) {
      throw new ConflictException('Email already registered');
    }
    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const user = this.users.create({ email: dto.email, passwordHash });
    const saved = await this.users.save(user);
    return { id: saved.id, email: saved.email, role: saved.role };
  }

  async login(dto: LoginDto): Promise<LoginResult> {
    const user = await this.users.findOne({ where: { email: dto.email } });
    if (user === null) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role };
    return { access_token: this.jwtService.sign(payload) };
  }
}
