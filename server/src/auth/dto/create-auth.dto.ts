import { IsNotEmpty, IsOptional, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../entities/auth.entity';

export class CreateAuthDto {
  @IsNotEmpty({ message: '用户名不能为空' })
  @ApiProperty({ description: '用户名' })
  username: string;

  @IsNotEmpty({ message: '密码不能为空' })
  @ApiProperty({ description: '密码' })
  password: string;

  @IsOptional()
  @IsEmail({}, { message: '邮箱格式不正确' })
  @ApiProperty({ description: '邮箱', required: false })
  email?: string;

  @IsOptional()
  @ApiProperty({ description: '角色', required: false })
  roles?: Role[];
}
