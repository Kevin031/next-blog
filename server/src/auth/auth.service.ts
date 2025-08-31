import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { BadRequestException } from '@nestjs/common';
import { AuthEntity } from './entities/auth.entity';
import { UserEntity } from '../user/entities/user.entity';
import * as bcryptjs from 'bcryptjs';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { RedisService } from '../redis/redis.service';
import { JwtService } from '@nestjs/jwt';
import { Role } from './entities/auth.entity';
import crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(AuthEntity)
    private readonly authRepository: Repository<AuthEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly redisService: RedisService,
    private readonly jwtService: JwtService,
    private readonly dataSource: DataSource,
  ) {}

  async signup(signupData: CreateAuthDto) {
    const { username } = signupData;

    // 检查用户名是否已存在
    const existingUser = await this.authRepository.findOne({
      where: { username },
    });
    if (existingUser) {
      throw new BadRequestException('用户名已存在');
    }

    // 使用事务确保 auth 和 user 记录同时创建
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. 创建认证记录
      const encryptedPassword = await bcryptjs.hashSync(
        signupData.password,
        10,
      );
      const authData = {
        username,
        password: encryptedPassword,
        email: signupData.email || undefined,
        roles: ['R_USER'] as Role[],
        isActive: true,
      };

      const savedAuth = await queryRunner.manager.save(AuthEntity, authData);

      // 2. 创建基础用户记录
      const userData = {
        nickname: username, // 默认使用用户名作为昵称
        email: signupData.email || undefined,
        status: 'active' as const,
        auth: savedAuth,
      };

      await queryRunner.manager.save(UserEntity, userData);

      // 提交事务
      await queryRunner.commitTransaction();

      // 存入 Redis
      // this.redisService.set(username, encryptedPassword);

      return {
        message: '注册成功',
        userInfo: {
          id: savedAuth.id,
          username: savedAuth.username,
          email: savedAuth.email,
        },
      };
    } catch (error) {
      // 回滚事务
      await queryRunner.rollbackTransaction();
      throw new BadRequestException('注册失败，请重试');
    } finally {
      // 释放连接
      await queryRunner.release();
    }
  }

  async login(loginData: CreateAuthDto) {
    const findUser = await this.authRepository.findOne({
      where: { username: loginData.username },
    });
    if (!findUser) {
      throw new BadRequestException('用户不存在');
    }

    // 检查账号是否被禁用
    if (!findUser.isActive) {
      throw new BadRequestException('账号已被禁用');
    }

    // 对比密码
    const compareRes: boolean = await bcryptjs.compare(
      loginData.password,
      findUser.password,
    );
    if (!compareRes) {
      throw new BadRequestException('密码错误');
    }

    // 更新最后登录时间
    await this.updateLastLogin(findUser.username);

    const payload = { username: findUser.username };
    return {
      token: this.jwtService.sign(payload),
      msg: '登录成功',
      userInfo: {
        id: findUser.id,
        username: findUser.username,
        email: findUser.email,
      },
    };
  }

  async getUser(username: string) {
    const userInfo: any = await this.authRepository.findOne({
      where: { username },
      relations: ['user'],
    });

    if (!userInfo) {
      throw new BadRequestException('用户不存在');
    }

    return {
      username: userInfo.username,
      roles: ['R_SUPER', 'R_ADMIN'],
      id: userInfo.id,
      email: userInfo.email,
      isActive: userInfo.isActive,
      lastLoginAt: userInfo.lastLoginAt,
      user: userInfo.user
        ? {
            id: userInfo.user.id,
            nickname: userInfo.user.nickname,
            email: userInfo.user.email,
            phone: userInfo.user.phone,
            avatar: userInfo.user.avatar,
            bio: userInfo.user.bio,
            gender: userInfo.user.gender,
            birthday: userInfo.user.birthday,
            location: userInfo.user.location,
            status: userInfo.user.status,
            createdAt: userInfo.user.createdAt,
            updatedAt: userInfo.user.updatedAt,
          }
        : null,
    };
  }

  async getUserWithProfile(username: string) {
    const authInfo = await this.authRepository.findOne({
      where: { username },
      relations: ['user'],
    });

    if (!authInfo) {
      throw new BadRequestException('用户不存在');
    }

    return {
      auth: {
        id: authInfo.id,
        username: authInfo.username,
        email: authInfo.email,
        isActive: authInfo.isActive,
        lastLoginAt: authInfo.lastLoginAt,
        createdAt: authInfo.createdAt,
      },
      profile: authInfo.user || null,
    };
  }

  async updateLastLogin(username: string) {
    await this.authRepository.update({ username }, { lastLoginAt: new Date() });
  }

  async toHex(str: string) {
    return crypto.createHash('sha256').update(str).digest('hex');
  }
}
