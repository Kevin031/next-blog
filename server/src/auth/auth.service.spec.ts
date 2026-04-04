import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthEntity } from './entities/auth.entity';
import { UserEntity } from '../user/entities/user.entity';
import { Repository, DataSource } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RedisService } from '../redis/redis.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcryptjs from 'bcryptjs';

// Mock bcryptjs
jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  hashSync: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let authRepository: Repository<AuthEntity>;
  let configService: ConfigService;
  let jwtService: JwtService;

  const mockAuthRepository = {
    findOne: jest.fn(),
    update: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  const mockDataSource = {
    createQueryRunner: jest.fn(),
  };

  const mockQueryRunner = {
    connect: jest.fn(),
    startTransaction: jest.fn(),
    manager: {
      save: jest.fn(),
    },
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
  };

  const mockRedisService = {
    set: jest.fn(),
    get: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(AuthEntity),
          useValue: mockAuthRepository,
        },
        {
          provide: getRepositoryToken(UserEntity),
          useValue: mockUserRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    authRepository = module.get<Repository<AuthEntity>>(
      getRepositoryToken(AuthEntity),
    );
    configService = module.get<ConfigService>(ConfigService);
    jwtService = module.get<JwtService>(JwtService);

    // Reset mocks
    jest.clearAllMocks();

    // Setup default mock returns
    mockDataSource.createQueryRunner.mockReturnValue(mockQueryRunner);
    mockJwtService.sign.mockReturnValue('mock-token');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    const mockUser = {
      id: 1,
      username: 'testuser',
      password: 'hashedpassword',
      email: 'test@example.com',
      isActive: true,
      roles: ['R_USER'],
      createdAt: new Date(),
      lastLoginAt: new Date(),
    };

    beforeEach(() => {
      mockAuthRepository.findOne.mockResolvedValue(mockUser);
      mockAuthRepository.update.mockResolvedValue(undefined);
      mockConfigService.get.mockReturnValue(undefined);
      (bcryptjs.compare as jest.Mock).mockResolvedValue(true);
    });

    describe('SKIP_PASSWORD_VALIDATION=true (开发环境)', () => {
      beforeEach(() => {
        mockConfigService.get.mockImplementation((key: string) => {
          if (key === 'SKIP_PASSWORD_VALIDATION') return 'true';
          return undefined;
        });
      });

      it('应该跳过密码验证并成功登录（输入错误密码）', async () => {
        // 模拟密码不匹配
        (bcryptjs.compare as jest.Mock).mockResolvedValue(false);

        const loginData = { username: 'testuser', password: 'wrongpassword' };

        const result = await service.login(loginData);

        expect(result).toEqual({
          token: 'mock-token',
          refreshToken: 'mock-token',
        });
        expect(jwtService.sign).toHaveBeenCalledWith({ username: 'testuser' });
        expect(jwtService.sign).toHaveBeenCalledWith(
          { username: 'testuser' },
          { expiresIn: '7d' },
        );
        expect(bcryptjs.compare).not.toHaveBeenCalled();
      });

      it('应该在跳过密码验证时记录警告日志', async () => {
        const loggerSpy = jest.spyOn(service['logger'], 'warn');

        const loginData = { username: 'testuser', password: 'anypassword' };

        await service.login(loginData);

        expect(loggerSpy).toHaveBeenCalledWith('跳过密码验证', {
          username: 'testuser',
        });
      });

      it('用户不存在时应该抛出错误', async () => {
        mockAuthRepository.findOne.mockResolvedValue(null);

        const loginData = { username: 'nonexistent', password: 'password' };

        await expect(service.login(loginData)).rejects.toThrow(
          BadRequestException,
        );
        await expect(service.login(loginData)).rejects.toThrow(
          '用户名或密码错误',
        );
      });

      it('用户被禁用时应该抛出错误', async () => {
        const disabledUser = { ...mockUser, isActive: false };
        mockAuthRepository.findOne.mockResolvedValue(disabledUser);

        const loginData = { username: 'testuser', password: 'password' };

        await expect(service.login(loginData)).rejects.toThrow(
          BadRequestException,
        );
        await expect(service.login(loginData)).rejects.toThrow('账号已被禁用');
      });
    });

    describe('SKIP_PASSWORD_VALIDATION=false 或未设置（生产环境）', () => {
      beforeEach(() => {
        mockConfigService.get.mockImplementation((key: string) => {
          if (key === 'SKIP_PASSWORD_VALIDATION') return 'false';
          return undefined;
        });
      });

      it('正确密码应该成功登录', async () => {
        (bcryptjs.compare as jest.Mock).mockResolvedValue(true);

        const loginData = { username: 'testuser', password: 'correctpassword' };

        const result = await service.login(loginData);

        expect(result).toEqual({
          token: 'mock-token',
          refreshToken: 'mock-token',
        });
        expect(bcryptjs.compare).toHaveBeenCalledWith(
          'correctpassword',
          'hashedpassword',
        );
      });

      it('错误密码应该抛出错误', async () => {
        (bcryptjs.compare as jest.Mock).mockResolvedValue(false);

        const loginData = { username: 'testuser', password: 'wrongpassword' };

        await expect(service.login(loginData)).rejects.toThrow(
          BadRequestException,
        );
        await expect(service.login(loginData)).rejects.toThrow(
          '用户名或密码错误',
        );
      });
    });

    describe('SKIP_PASSWORD_VALIDATION 未设置', () => {
      beforeEach(() => {
        mockConfigService.get.mockReturnValue(undefined);
      });

      it('应该执行正常密码验证', async () => {
        (bcryptjs.compare as jest.Mock).mockResolvedValue(true);

        const loginData = { username: 'testuser', password: 'correctpassword' };

        const result = await service.login(loginData);

        expect(result).toEqual({
          token: 'mock-token',
          refreshToken: 'mock-token',
        });
        expect(bcryptjs.compare).toHaveBeenCalledWith(
          'correctpassword',
          'hashedpassword',
        );
      });
    });
  });
});
