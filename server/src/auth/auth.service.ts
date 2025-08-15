import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException } from '@nestjs/common';
import { AuthEntity } from './entities/auth.entity';
import * as bcryptjs from 'bcryptjs';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { RedisService } from '../redis/redis.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(AuthEntity)
    private readonly authRepository: Repository<AuthEntity>,
    private readonly redisService: RedisService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(signupData: CreateAuthDto) {
    const { username } = signupData;
    const user = await this.authRepository.findOne({ where: { username } });
    if (user) {
      throw new BadRequestException('用户名已存在');
    }
    // 对密码进行加密处理
    signupData.password = await bcryptjs.hashSync(signupData.password, 10);
    await this.authRepository.save(signupData);
    // 尝试存入 redis 中
    this.redisService.set(username, signupData.password);
    return '注册成功';
  }

  async login(loginData: CreateAuthDto) {
    const findUser = await this.authRepository.findOne({
      where: { username: loginData.username },
    });
    if (!findUser) {
      throw new BadRequestException('用户不存在');
    }
    // 对比密码
    const compareRes: boolean = await bcryptjs.compare(
      loginData.password,
      findUser.password,
    );
    if (!compareRes) {
      throw new BadRequestException('密码错误');
    }
    const payload = { username: findUser.username };
    return {
      access_token: this.jwtService.sign(payload),
      msg: '登录成功',
    };
  }
}
