import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UserRole } from '../entities/user.entity';
import type { JwtPayload } from './jwt.strategy';

const mockAuthService = {
  register: jest.fn(),
  login: jest.fn(),
};

const jwtPayload: JwtPayload = {
  sub: 'uuid-1',
  email: 'a@b.com',
  role: UserRole.PARTICIPANT,
};

// Guard that always allows and injects jwtPayload into request.user
const allowGuard = {
  canActivate: (ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest<{ user: JwtPayload }>();
    req.user = jwtPayload;
    return true;
  },
};

// Guard that always denies
const denyGuard = {
  canActivate: (_ctx: ExecutionContext) => false,
};

describe('AuthController', () => {
  describe('register and login pass-through', () => {
    let controller: AuthController;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        controllers: [AuthController],
        providers: [{ provide: AuthService, useValue: mockAuthService }],
      })
        .overrideGuard(JwtAuthGuard)
        .useValue(allowGuard)
        .compile();

      controller = module.get<AuthController>(AuthController);
      jest.clearAllMocks();
    });

    it('register delegates to AuthService', async () => {
      const dto = { email: 'a@b.com', password: 'pass' };
      const expected = { id: 'uuid-1', email: 'a@b.com', role: UserRole.PARTICIPANT };
      mockAuthService.register.mockResolvedValue(expected);

      const result = await controller.register(dto);

      expect(result).toEqual(expected);
      expect(mockAuthService.register).toHaveBeenCalledWith(dto);
    });

    it('login delegates to AuthService', async () => {
      const dto = { email: 'a@b.com', password: 'pass' };
      const expected = { access_token: 'tok' };
      mockAuthService.login.mockResolvedValue(expected);

      const result = await controller.login(dto);

      expect(result).toEqual(expected);
    });
  });

  describe('GET /auth/me with valid token', () => {
    let controller: AuthController;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        controllers: [AuthController],
        providers: [{ provide: AuthService, useValue: mockAuthService }],
      })
        .overrideGuard(JwtAuthGuard)
        .useValue(allowGuard)
        .compile();

      controller = module.get<AuthController>(AuthController);
    });

    it('returns id, email, role from JWT payload', () => {
      const result = controller.me(jwtPayload);

      expect(result).toEqual({ id: 'uuid-1', email: 'a@b.com', role: UserRole.PARTICIPANT });
    });
  });

  describe('GET /auth/me with no token', () => {
    it('JwtAuthGuard canActivate returns false when no token provided', () => {
      const mockCtx = {} as ExecutionContext;
      expect(denyGuard.canActivate(mockCtx)).toBe(false);
    });
  });
});
