import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../../database/prisma.service';
import * as bcrypt from 'bcryptjs';

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let prisma: any;
  let jwt: any;

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    jwt = {
      sign: jest.fn().mockReturnValue('mock-token'),
      verify: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwt },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('login', () => {
    it('should throw UnauthorizedException if user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(service.login('test@test.com', 'pass')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw if password is null (OAuth user)', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: '1', email: 'test@test.com', password: null });
      await expect(service.login('test@test.com', 'pass')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw if password is invalid', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: '1', email: 'test@test.com', password: 'hashed', type: 'USER', tenantId: 't1',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      await expect(service.login('test@test.com', 'wrong')).rejects.toThrow(UnauthorizedException);
    });

    it('should return tokens on valid login', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: '1', email: 'test@test.com', password: 'hashed', firstName: 'Ali',
        lastName: 'Y', type: 'USER', tenantId: 't1',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login('test@test.com', 'pass');
      expect(result.accessToken).toBe('mock-token');
      expect(result.refreshToken).toBe('mock-token');
      expect(result.user.email).toBe('test@test.com');
      expect(jwt.sign).toHaveBeenCalledTimes(2);
    });
  });

  describe('register', () => {
    it('should throw ConflictException if email exists', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: '1' });
      await expect(service.register({ email: 'x@x.com', password: 'longpass1' })).rejects.toThrow(ConflictException);
    });

    it('should create user and return tokens', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('$2a$hashed');
      prisma.user.create.mockResolvedValue({
        id: '2', email: 'new@test.com', firstName: null, lastName: null, type: 'USER', tenantId: null,
      });

      const result = await service.register({ email: 'new@test.com', password: 'secure123' });
      expect(result.accessToken).toBe('mock-token');
      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ email: 'new@test.com', password: '$2a$hashed' }),
        }),
      );
    });
  });

  describe('refreshToken', () => {
    it('should throw on invalid token type', async () => {
      jwt.verify.mockReturnValue({ sub: '1', tokenType: 'access' });
      await expect(service.refreshToken('bad')).rejects.toThrow(UnauthorizedException);
    });

    it('should return new tokens on valid refresh', async () => {
      jwt.verify.mockReturnValue({ sub: '1', email: 'a@b.com', tenantId: 't', type: 'USER', tokenType: 'refresh' });
      prisma.user.findUnique.mockResolvedValue({
        id: '1', email: 'a@b.com', firstName: null, lastName: null, type: 'USER', tenantId: 't',
      });

      const result = await service.refreshToken('valid-refresh');
      expect(result.accessToken).toBeDefined();
    });
  });

  describe('changePassword', () => {
    it('should throw if old password is wrong', async () => {
      prisma.user.findUnique.mockResolvedValue({ password: 'hashed' });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      await expect(service.changePassword('1', 'wrong', 'newpass123')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw if new password is too short', async () => {
      prisma.user.findUnique.mockResolvedValue({ password: 'hashed' });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      await expect(service.changePassword('1', 'old', 'short')).rejects.toThrow(UnauthorizedException);
    });

    it('should update password successfully', async () => {
      prisma.user.findUnique.mockResolvedValue({ password: 'hashed' });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('$2a$new');
      prisma.user.update.mockResolvedValue({});

      await service.changePassword('1', 'old', 'newpassword123');
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { password: '$2a$new' },
      });
    });
  });
});
