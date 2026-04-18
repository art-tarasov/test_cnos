import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { User, UserRole } from '../entities/user.entity';

jest.mock('bcrypt');
const mockedBcrypt = jest.mocked(bcrypt);

const mockUserRepo = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn(),
};

const baseUser: User = {
  id: 'uuid-1',
  email: 'a@b.com',
  passwordHash: 'hashed',
  role: UserRole.PARTICIPANT,
  createdAt: new Date(),
  updatedAt: new Date(),
  quizzes: [],
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('stores hashed password, not plaintext', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);
      mockedBcrypt.hash.mockResolvedValue('$2b$12$hashed' as never);
      mockUserRepo.create.mockImplementation((data: Partial<User>) => data as User);
      mockUserRepo.save.mockImplementation(async (u: Partial<User>) =>
        ({ ...baseUser, ...u } as User),
      );

      await service.register({ email: 'a@b.com', password: 'secret' });

      expect(mockedBcrypt.hash).toHaveBeenCalledWith('secret', 12);
      const [savedArg] = mockUserRepo.create.mock.calls[0] as [Partial<User>];
      expect(savedArg.passwordHash).not.toBe('secret');
      expect(savedArg.passwordHash).toBe('$2b$12$hashed');
    });

    it('returns id, email, role on success', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);
      mockedBcrypt.hash.mockResolvedValue('hashed' as never);
      mockUserRepo.create.mockImplementation((data: Partial<User>) => data as User);
      mockUserRepo.save.mockResolvedValue(baseUser);

      const result = await service.register({ email: 'a@b.com', password: 'pass' });

      expect(result).toEqual({ id: 'uuid-1', email: 'a@b.com', role: UserRole.PARTICIPANT });
    });

    it('throws ConflictException when email already registered', async () => {
      mockUserRepo.findOne.mockResolvedValue(baseUser);

      await expect(service.register({ email: 'a@b.com', password: 'pass' })).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('login', () => {
    it('returns access_token for valid credentials', async () => {
      mockUserRepo.findOne.mockResolvedValue(baseUser);
      mockedBcrypt.compare.mockResolvedValue(true as never);
      mockJwtService.sign.mockReturnValue('signed.jwt.token');

      const result = await service.login({ email: 'a@b.com', password: 'secret' });

      expect(result).toEqual({ access_token: 'signed.jwt.token' });
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: baseUser.id,
        email: baseUser.email,
        role: baseUser.role,
      });
    });

    it('throws UnauthorizedException when email not found', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);

      await expect(service.login({ email: 'x@b.com', password: 'pass' })).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('throws UnauthorizedException when password is wrong', async () => {
      mockUserRepo.findOne.mockResolvedValue(baseUser);
      mockedBcrypt.compare.mockResolvedValue(false as never);

      await expect(service.login({ email: 'a@b.com', password: 'wrong' })).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
