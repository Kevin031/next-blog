import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthEntity } from './entities/auth.entity';
import { UserEntity } from '../user/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from '../common/constants';
import { RedisModule } from '../redis/redis.module';
import JwtAuthStrategy from './jwt-auth.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([AuthEntity, UserEntity]),
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: jwtConstants.expiresIn },
    }),
    RedisModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthStrategy],
})
export class AuthModule {}
