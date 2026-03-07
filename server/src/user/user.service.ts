import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthEntity } from '../auth/entities/auth.entity';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(AuthEntity)
    private readonly authRepository: Repository<AuthEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { username, password, email, ...userData } = createUserDto;

    // 检查用户名是否已存在
    const existingAuth = await this.authRepository.findOne({
      where: { username },
    });

    if (existingAuth) {
      throw new BadRequestException('用户名已存在');
    }

    try {
      // 1. 创建 Auth 记录（密码已前端加密）
      const auth = this.authRepository.create({
        username,
        password, // 前端已使用 sha256 加密
        email: email || null,
        isActive: true,
      });
      const savedAuth = await this.authRepository.save(auth);

      // 2. 创建 User 记录并关联 Auth
      const user = this.userRepository.create({
        ...userData,
        auth: savedAuth,
        status: userData.status || 'active',
      });
      const savedUser = await this.userRepository.save(user);

      return {
        message: '用户创建成功',
        data: {
          id: savedUser.id,
          ...savedUser,
          auth: {
            id: savedAuth.id,
            username: savedAuth.username,
            email: savedAuth.email,
            createdAt: savedAuth.createdAt,
          },
        },
      };
    } catch (error) {
      throw new BadRequestException('创建用户失败');
    }
  }

  async findAll({
    page = 1,
    pageSize = 10,
  }: {
    page: number;
    pageSize: number;
  }) {
    const [list, totalCount] = await this.userRepository.findAndCount({
      relations: ['auth'],
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { createdAt: 'DESC' },
    });

    // 过滤敏感信息
    const filteredList = list.map((user) => ({
      ...user,
      auth: user.auth
        ? {
            id: user.auth.id,
            username: user.auth.username,
            email: user.auth.email,
            lastLoginAt: user.auth.lastLoginAt,
            isActive: user.auth.isActive,
            createdAt: user.auth.createdAt
              ? new Date(user.auth.createdAt).getTime()
              : null,
            // 不返回密码
          }
        : null,
    }));

    return {
      list: filteredList,
      count: totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      currentPage: page,
    };
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['auth'],
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 过滤敏感信息
    return {
      ...user,
      auth: user.auth
        ? {
            id: user.auth.id,
            username: user.auth.username,
            email: user.auth.email,
            lastLoginAt: user.auth.lastLoginAt,
            isActive: user.auth.isActive,
            createdAt: user.auth.createdAt,
          }
        : null,
    };
  }

  async findByAuthId(authId: number) {
    const user = await this.userRepository.findOne({
      where: { auth: { id: authId } },
      relations: ['auth'],
    });

    if (!user) {
      throw new NotFoundException('用户信息不存在');
    }

    return {
      ...user,
      auth: {
        id: user.auth.id,
        username: user.auth.username,
        email: user.auth.email,
        lastLoginAt: user.auth.lastLoginAt,
        isActive: user.auth.isActive,
        createdAt: user.auth.createdAt,
      },
    };
  }

  async findByUsername(username: string) {
    const user = await this.userRepository.findOne({
      where: { auth: { username } },
      relations: ['auth'],
    });

    if (!user) {
      throw new NotFoundException('用户信息不存在');
    }

    return {
      ...user,
      auth: {
        id: user.auth.id,
        username: user.auth.username,
        email: user.auth.email,
        lastLoginAt: user.auth.lastLoginAt,
        isActive: user.auth.isActive,
        createdAt: user.auth.createdAt,
      },
    };
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    try {
      await this.userRepository.update(id, updateUserDto);
      const updatedUser = await this.findOne(id);
      return {
        message: '用户信息更新成功',
        data: updatedUser,
      };
    } catch (error) {
      throw new BadRequestException('更新用户信息失败');
    }
  }

  async remove(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    try {
      await this.userRepository.delete(id);
      return {
        message: '用户删除成功',
      };
    } catch (error) {
      throw new BadRequestException('删除用户失败');
    }
  }

  async getUsersWithAuth(query: QueryUserDto) {
    const {
      page = 1,
      pageSize = 10,
      status,
      search,
      phone,
      startTime,
      endTime,
    } = query;
    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.auth', 'auth');

    // 状态筛选
    if (status) {
      queryBuilder.andWhere('user.status = :status', { status });
    }

    // 搜索功能 - 支持用户名、昵称、邮箱搜索
    if (search) {
      queryBuilder.andWhere(
        '(user.nickname LIKE :search OR auth.username LIKE :search OR auth.email LIKE :search)',
        { search: `%${search}%` },
      );
    }

    // 手机号精确搜索
    if (phone) {
      queryBuilder.andWhere('user.phone = :phone', { phone });
    }

    // 创建时间范围筛选
    if (startTime) {
      queryBuilder.andWhere('user.createdAt >= :startTime', {
        startTime: new Date(startTime),
      });
    }
    if (endTime) {
      queryBuilder.andWhere('user.createdAt <= :endTime', {
        endTime: new Date(endTime + ' 23:59:59'),
      });
    }

    const [list, totalCount] = await queryBuilder
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('user.createdAt', 'DESC')
      .getManyAndCount();

    // 过滤敏感信息
    const filteredList = list.map((user) => ({
      ...user,
      auth: user.auth
        ? {
            id: user.auth.id,
            username: user.auth.username,
            email: user.auth.email,
            lastLoginAt: user.auth.lastLoginAt,
            isActive: user.auth.isActive,
            createdAt: user.auth.createdAt,
          }
        : null,
    }));

    return {
      list: filteredList,
      count: totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      currentPage: page,
    };
  }
}
